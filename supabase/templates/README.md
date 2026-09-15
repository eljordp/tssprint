# Customer authentication emails

Canonical HTML for Supabase Authentication → Emails. Deployment of the website does not apply these templates; paste the HTML into the corresponding Supabase template and save.

- Confirm sign up subject: `Welcome to The Sticker Smith — confirm your email`
- Reset password subject: `Reset your Sticker Smith password`
- Preserve the Supabase `{{ .ConfirmationURL }}` token. Never save live authentication links in source control.
- Test with the user-approved inbox. Do not send test messages to customers.
