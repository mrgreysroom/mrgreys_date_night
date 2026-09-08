MR GREY'S WORLD — UPDATE 09

WHAT CHANGED
1) DESIRE visual regression fixed
- Restored the complete MR GREY'S DESIRE CSS block from Update 04.
- Keeps Update 08 "first taste" panel.

2) Homepage
- Public Room benefit no longer exposes LETOKONCI.
- "Nové pre vás" now shows only real/current items: Date Night, DESIRE, Denník luxusnej spoločníčky, Víkend v Tatrách.
- Cards made more compact.
- Instagram outline icon added in MR GREY'S colors.
- Facebook outline icon visually prepared; exact FB URL still needs to be supplied before making it live.

3) Stories
- "Stretla som ho v divadle" changed to "Stretla som ho v kine — I. časť".
- "Víkend v Tatrách" is a serial story.
- Added serial "Denník luxusnej spoločníčky — I. časť" about a fictional adult Slovak woman from a small village who moves to Bratislava.
- Stories are substantially longer and more detailed.
- Public visitors see only a short taste; full text is available to active Club members.
- Serial stories end with a continuation teaser.
- Like button now calls a server endpoint and stores member/story likes in Supabase (table included in SQL migration).

4) Academy
- Replaced technical placeholder with a full premium COMING SOON page.
- Topics: relationships/psychology, sex/intimacy, BDSM/exploration, men & women.
- Added specific teaser questions.
- Added BONDAGE BASICS course teaser.

5) Club
- /club is now a member dashboard, not another marketing page.
- If there is no active Club session, /club redirects to /club/join.
- New top bell uses an outline SVG instead of the old dot/emoji look.
- Dashboard shows unlocked games, DESIRE entitlements, Stories, Room benefit, Academy, Couple Challenge and membership status.
- Public homepage never exposes the Room code; active Club dashboard can show LETOKONCI through 30 Sep 2026.

6) Stripe sandbox Club flow
- /club/join = premium registration/checkout entry.
- 9.90 EUR/month Founding Member price: price_1UCg6zPeOVi2qayNrXEcqUN9
- Checkout mode=subscription, automatic recurring billing.
- Success returns directly to /club/welcome, then automatically activates and redirects to /club.
- No email click is required to enter Club after payment.
- Webhook is the durable Supabase source of truth.
- Signed httpOnly Club cookie is created only after server-side Stripe verification.
- Subscription period end is used as local Club session expiry.

REQUIRED VERCEL ENV VARIABLES
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLUB_SESSION_SECRET=<long random secret>
NEXT_PUBLIC_SITE_URL=https://mrgrey.sk
NEXT_PUBLIC_SUPABASE_URL=https://siferzggaubvtjlqdckj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only service role key>

IMPORTANT
- Never expose STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLUB_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY in browser code.
- Keep this deployment in Stripe TEST/SANDBOX until end-to-end testing succeeds.
- Run supabase/club-membership.sql once before webhook testing.
- Configure Stripe webhook endpoint:
  https://mrgrey.sk/api/stripe/webhook
  Events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.paid, invoice.payment_failed
- This update uses Stripe's HTTPS API directly, so no stripe npm package is required.
- Exact Facebook page/profile URL is still needed to activate the FB icon.
