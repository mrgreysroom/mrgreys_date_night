MR GREY'S WORLD — UPDATE 12
Functional Club, DESIRE, account, notifications & launch foundation

WHAT IS INCLUDED
- Club header bell is real/clickable; unread counter comes from Supabase, no fake hardcoded badge.
- Profile avatar opens MÔJ ÚČET menu.
- /club/account: editable name/nickname, DOB, language, marketing/service notification preferences.
- Story follow/unfollow stored in Supabase and manageable from account.
- Public Story = opening taste only; active Club = full Story. Serial stories have follow button.
- Stories strengthened with more sensual wardrobe/touch/body-reaction detail while keeping premium tone.
- Mobile Club hero now uses /club-hero-clean.jpg, removing baked legacy bell/avatar from the image.
- OWNER/ADMIN Date Night entitlement is present in the existing Date Night entitlements table.
- /play/date-night creates a secure Supabase magic-link bridge to datenight.mrgreysroom.sk so Club members do not land on the sales page.
- Active Stripe Club subscriptions are mirrored to a synthetic Date Night `complete` entitlement; cancellation removes only the synthetic Club entitlement.
- Five deep DESIRE routes are real and separate: my-dvaja, bez-filtra, nasa-buducnost, intimita, tajne-tuzby.
- Deep DESIRE A+B flow: private answers, partner invitation, privacy-safe shared result, result history saved for both emails.
- No percentage, no compatibility ratio, no visible mismatch score. Sensitive no/nonmatch answers are not exposed in shared results.
- Purchased deep DESIRE can be owned permanently via product_entitlements. Club/OWNER/ADMIN bypass purchase.
- Deep DESIRE Stripe checkout endpoints use existing sandbox €2.99 price IDs.
- DESIRE Journey: predefined sequence, first step immediately, second after 3 days, then later steps on preset intervals.
- Journey stores both partner emails, saves state in account, and has a daily Vercel cron endpoint for scheduled unlock notifications.
- Branded MR GREY'S service-email HTML engine added (black/purple/gold) with templates for account welcome, Club welcome, failed payment, cancellation, deep-test purchase, DESIRE invite/result, Story continuation, Journey step, reactivation.
- Account-only login supported: people who own a standalone product can log in even without active Club.
- Stripe webhook expanded for Club access, Date Night access, one-time DESIRE entitlements and service email triggers.
- New database indexes/tables designed to keep common member/result/notification lookups small as traffic grows.

SUPABASE
The Update 12 database migration was already applied to project siferzggaubvtjlqdckj during preparation of this package.
The SQL is also appended to supabase/club-membership.sql for version-control/reproducibility. Do not need to run it again; statements use IF NOT EXISTS where applicable.

VERCEL ENV — REQUIRED BEFORE END-TO-END PAYMENT/EMAIL TEST
Already configured by Tomi:
- SUPABASE_SECRET_KEY

Confirm/add:
- NEXT_PUBLIC_SITE_URL=https://mrgrey.sk
- CLUB_SESSION_SECRET=<long random secret; current fallback can use server secret but dedicated secret is preferred>
- STRIPE_SECRET_KEY=<Stripe sandbox sk_test_...>
- STRIPE_WEBHOOK_SECRET=<whsec_... for https://mrgrey.sk/api/stripe/webhook>
- CRON_SECRET=<long random secret>

For branded service email sending:
- RESEND_API_KEY=<provider server key>
- MRGREYS_EMAIL_FROM=MR GREY'S <club@mrgrey.sk>
The sending domain/address must first be verified with the email provider. Without these two variables the app safely skips sending; it does not throw and does not claim delivery.

VERCEL CRON
vercel.json contains a production daily trigger at 07:00 UTC for /api/cron/journey. It requires CRON_SECRET.
This is intentionally daily because Journey steps are expressed as days (e.g. “o 3 dni”), not exact minute-by-minute timers.

STRIPE WEBHOOK EVENTS TO ENABLE
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.paid
- invoice.payment_failed

TEST ORDER AFTER DEPLOY
1. OWNER: open Club, click bell/profile, edit account, follow/unfollow a Story.
2. OWNER: click Date Night — should bridge to the unlocked full game, not sales page.
3. OWNER: open each of the 5 deep DESIRE cards — each has its own questions.
4. Complete one deep test as A, invite a second email, complete B, verify privacy-safe result and saved history in MÔJ ÚČET.
5. Start DESIRE Journey and verify the initial state + next unlock information.
6. Configure Stripe sandbox env + webhook and make a test Club subscription.
7. Confirm Club activation, logout/login, Date Night access, and cancellation behavior.
8. Configure email provider/domain, then test invite/result/payment emails.
9. Only after all sandbox tests pass, create/use LIVE Stripe prices/secrets and switch payment traffic live.

COMMIT SUGGESTION
Update 12: Functional Club, Desire, notifications & launch foundation
