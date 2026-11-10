# Nutrica account emails

Sign-up confirmation, password reset and email-change messages are sent by **Supabase Auth**.
Out of the box they come from `noreply@mail.app.supabase.io` with Supabase's wording, and the
shared sender is heavily rate limited (a handful of emails per hour). To send them as
**Nutrica &lt;noreply@nutrica.fit&gt;** you need a custom SMTP provider and branded templates.
None of this is configured from code; it lives in the Supabase dashboard.

## 1. Custom SMTP (sender name and address)

1. Create an account with a transactional email provider (Resend, Postmark, SendGrid, Amazon SES, ...).
2. Add and verify the `nutrica.fit` sending domain. The provider gives you DNS records
   (SPF, DKIM, usually a return-path/MX record). `nutrica.fit` uses Vercel DNS, so they can be
   added in the Vercel dashboard (Domains -> nutrica.fit -> DNS records) or with
   `vercel dns add nutrica.fit <name> <type> <value>`.
3. In Supabase: **Authentication -> Emails -> SMTP Settings**, enable custom SMTP and set
   - Sender email: `noreply@nutrica.fit`
   - Sender name: `Nutrica`
   - Host, port, username and password from the provider.

## 2. URL configuration

**Authentication -> URL Configuration**

- Site URL: `https://nutrica.fit`
- Redirect URLs: `https://nutrica.fit/**` (add preview/local origins if you use them)

## 3. Branded templates

**Authentication -> Emails -> Templates**: paste the files from
[`supabase/email-templates/`](../supabase/email-templates):

| Template | File | Suggested subject |
| --- | --- | --- |
| Confirm signup | `confirm-signup.html` | Confirm your Nutrica email |
| Reset password | `reset-password.html` | Reset your Nutrica password |
| Change email address | `change-email.html` | Confirm your new Nutrica email |

### Why the reset template links to the site instead of `{{ .ConfirmationURL }}`

`{{ .ConfirmationURL }}` is a link to Supabase that is **used up the moment anything opens it**.
Corporate and university mail systems (for example Microsoft Defender Safe Links) open every link
in a message to scan it, so by the time the person clicks, the one-time token is gone and they
see "link is invalid or has expired".

The reset template instead points to
`https://nutrica.fit/reset-password?token_hash={{ .TokenHash }}&type=recovery`. Opening that URL
does nothing by itself; the token is verified only when the person submits a new password
(see `frontend/src/pages/auth/pages/ResetPassword.jsx`), which scanners never do. The page also
still accepts the default `ConfirmationURL` redirect, so emails sent with the old template keep working.
