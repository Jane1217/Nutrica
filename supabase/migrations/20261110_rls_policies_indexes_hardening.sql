-- Database hardening and persistence fix.
-- STATUS: applied to the production project (rejsoyzhhukatdaebgtq) on 2026-11-10 as migration
-- "rls_policies_indexes_hardening". Kept here so the schema can be rebuilt from the repo.
--
-- 1. daily_home_data had row level security ON and NO policies. The browser reads and writes
--    this table directly (selected puzzle for the day, per-day snapshots), so every request
--    from a signed-in user was silently denied: a user with rows saw 0 of them.
-- 2. Policies re-written as `(select auth.uid())` (evaluated once per query, not per row),
--    restricted to signed-in users, and the duplicate nutrition_goal policies removed.
-- 3. Index for the most common query (a user's foods, newest first) and removal of a
--    duplicate index.
-- 4. Two SECURITY DEFINER helpers (check_email_exists, get_user_by_email) were callable with
--    the public anon key and let anyone test whether an email has an account and read its
--    id / confirmation state. Nothing in the app calls them.
-- 5. Tables only the API server touches (service key) no longer grant anything to the
--    browser roles, and anon no longer has table privileges at all.

begin;

-- 1. daily_home_data: owner-only policies -------------------------------------------------
create policy "Users can view own daily home data" on public.daily_home_data
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own daily home data" on public.daily_home_data
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own daily home data" on public.daily_home_data
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own daily home data" on public.daily_home_data
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 2. Existing policies: signed-in only, initplan-friendly, no duplicates ------------------
drop policy "Users are permitted for all actions" on public.nutrition_goal;
drop policy "Users can insert their own goals" on public.nutrition_goal;

alter policy "Users can view own nutrition goals" on public.nutrition_goal
  to authenticated using ((select auth.uid()) = user_id);
alter policy "Users can insert own nutrition goals" on public.nutrition_goal
  to authenticated with check ((select auth.uid()) = user_id);
alter policy "Users can update own nutrition goals" on public.nutrition_goal
  to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "Users can delete own nutrition goals" on public.nutrition_goal
  to authenticated using ((select auth.uid()) = user_id);

alter policy "Users can view own food" on public.food
  to authenticated using ((select auth.uid()) = user_id);
alter policy "Users can insert own food" on public.food
  to authenticated with check ((select auth.uid()) = user_id);
alter policy "Users can update own food" on public.food
  to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "Users can delete own food" on public.food
  to authenticated using ((select auth.uid()) = user_id);

alter policy "Users can view their own camera permission status" on public.user_camera_permission
  to authenticated using ((select auth.uid()) = user_id);
alter policy "Users can insert their own camera permission status" on public.user_camera_permission
  to authenticated with check ((select auth.uid()) = user_id);
alter policy "Users can update their own camera permission status" on public.user_camera_permission
  to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter policy "Users can view their own congratulations shown status" on public.user_congratulations_shown
  to authenticated using ((select auth.uid()) = user_id);
alter policy "Users can insert their own congratulations shown status" on public.user_congratulations_shown
  to authenticated with check ((select auth.uid()) = user_id);
alter policy "Users can update their own congratulations shown status" on public.user_congratulations_shown
  to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 3. Indexes ------------------------------------------------------------------------------
-- food is queried by user_id and ordered / ranged by time; the foreign key had no index.
create index if not exists idx_food_user_time on public.food (user_id, time desc);
-- idx_user_date duplicates the unique_user_date constraint (same columns).
drop index if exists public.idx_user_date;

-- 4. Account-enumeration helpers ----------------------------------------------------------
revoke execute on function public.check_email_exists(text) from public, anon, authenticated;
revoke execute on function public.get_user_by_email(text) from public, anon, authenticated;

alter function public.check_email_exists(text) set search_path = '';
alter function public.update_updated_at_column() set search_path = '';
alter function public.log_user_deletion() set search_path = '';
alter function public.has_nutrition_image(uuid, date) set search_path = '';
alter function public.get_first_nutrition_image_date(uuid) set search_path = '';

-- 5. Table privileges ---------------------------------------------------------------------
-- Only the API (service role) reads/writes these; the browser never queries them directly.
revoke all on public.user_collections, public.user_congratulations_shown,
  public.user_camera_permission, public.collection_puzzles from anon, authenticated;
-- The browser queries these as a signed-in user only.
revoke all on public.food, public.nutrition_goal, public.daily_home_data from anon;

commit;
