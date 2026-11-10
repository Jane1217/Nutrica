#!/usr/bin/env bash
# Deploy Nutrica to production on Vercel.
#
#   scripts/deploy.sh web    # frontend  -> nutrica-web (https://nutrica.fit), static
#   scripts/deploy.sh api    # backend   -> nutrica-api (https://nutrica-api.vercel.app)
#   scripts/deploy.sh all    # both (API first)
#
# Requires: Vercel CLI >= 47 (`npm i -g vercel@latest`), logged in (`vercel login`),
# Node 22+. The frontend is built locally with the production environment variables
# stored in the Vercel project, then the built `dist/` folder is uploaded.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

command -v vercel >/dev/null 2>&1 || { echo "Vercel CLI not found. Install it with: npm i -g vercel@latest" >&2; exit 1; }

link_project() { # <dir> <project>
  [ -f "$1/.vercel/project.json" ] || (cd "$1" && vercel link --yes --project "$2")
}

deploy_api() {
  link_project "$ROOT/backend" nutrica-api
  (cd "$ROOT/backend" && vercel deploy --prod --yes)
}

deploy_web() {
  link_project "$ROOT/frontend" nutrica-web
  cd "$ROOT/frontend"
  trap 'rm -f .env.production.local' EXIT
  vercel env pull .env.production.local --environment=production --yes >/dev/null
  NODE_ENV=production npm run build
  rm -f .env.production.local

  # dist/ is deployed as a static site: it needs the rewrites/headers and the project link.
  cp vercel.json dist/vercel.json
  mkdir -p dist/.vercel && cp .vercel/project.json dist/.vercel/project.json
  (cd dist && vercel deploy --prod --yes)
}

case "${1:-}" in
  web) deploy_web ;;
  api) deploy_api ;;
  all) deploy_api; deploy_web ;;
  *) echo "Usage: $0 {web|api|all}" >&2; exit 1 ;;
esac
