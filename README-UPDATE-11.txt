MR GREY'S WORLD — UPDATE 11

Changes:
- Homepage: visible gold "Už ste členom? PRIHLÁSIŤ SA →" next to/below Club CTA on mobile.
- Club registration: password must be entered twice and match before account creation.
- Language switcher fixed so SK works again after CZ/PL/EN.
- Supabase server code accepts SUPABASE_SECRET_KEY (recommended modern secret key) or legacy SUPABASE_SERVICE_ROLE_KEY.
- CLUB_SESSION_SECRET can still be set separately; if omitted, server falls back to the Supabase server secret for signed Club session cookies.
- Owner/admin team rows are already created in Supabase migration: tomas27matta@gmail.com owner, timeamrazikova@gmail.com admin.

Before testing registration on Vercel production, add ONE server-only env variable:
SUPABASE_SECRET_KEY=<your Supabase secret key>
(or legacy SUPABASE_SERVICE_ROLE_KEY).
Do NOT prefix this key with NEXT_PUBLIC_. Redeploy after adding it.
