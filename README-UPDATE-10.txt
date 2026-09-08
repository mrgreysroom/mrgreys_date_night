MR GREY'S WORLD — UPDATE 10

MAIN CHANGES
- Owner/admin first registration now creates a password-based Supabase Auth account.
- Internal role lookup in public.team_access.
- tomas27matta@gmail.com = owner = 100% full access without Stripe.
- timeamrazikova@gmail.com = admin = 100% full access without Stripe.
- Normal users: registration -> account -> Stripe subscription checkout.
- Login page added: /login (email + password).
- Existing paid members can log in and Club access is checked from club_memberships.
- Owner/admin bypass payment and are redirected directly to /club.
- Club shows internal FULL ACCESS badge for owner/admin.
- Visible SK / CZ / PL / EN language switcher + persistent locale URL/cookie foundation.
- DESIRE entry now has the short "Ako to funguje?" explanation.

IMPORTANT BEFORE AUTH TEST
1. Run the SQL in supabase/club-membership.sql in Supabase SQL Editor.
2. In Vercel Environment Variables set:
   NEXT_PUBLIC_SUPABASE_URL=https://siferzggaubvtjlqdckj.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your Supabase service role key>
   CLUB_SESSION_SECRET=<long random secret, 32+ chars>
   NEXT_PUBLIC_SITE_URL=https://mrgrey.sk
3. Redeploy.
4. Open /club/join and register with the owner email. Choose your own password.
   Owner/admin are sent directly into /club without Stripe.

STRIPE (NEXT STEP)
- STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET stay sandbox/test until end-to-end test is verified.
- Club price: price_1UCg6zPeOVi2qayNrXEcqUN9 (€9.90/month sandbox).

LANGUAGES
- Update 10 installs the route/switcher foundation for SK/CZ/PL/EN across MR GREY'S WORLD.
- Full editorial localization of all long-form Stories and all DESIRE question banks should be completed after Slovak master copy is locked, so we do not translate drafts repeatedly.
- The Date Night PLAY game lives in the separate private repository mrgreysroom/mrgreys_date_night and cannot be changed by this MR-GREYS-WORLD overlay. It needs its own multilingual update in that project.
