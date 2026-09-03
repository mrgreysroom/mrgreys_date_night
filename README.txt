MR GREY'S DATE NIGHT — V12 FINAL SALE READY

CONTENT
- ROMANTIC: 60 cards
- SECRETS: 80 cards
- DARE: 80 cards
- AFTER DARK: 80 cards
- TOTAL: 300 cards
- 4 SPECIAL X per pack = 16 SPECIAL X total
- Demo: 2 selected packs × 4 cards; positions 3 and 7 are SPECIAL X.

UX
- Rotating landing teaser (no MP4 required).
- Animated devil visuals.
- In full game, devil text lines appear at irregular intervals with at least 5 cards between lines.
- Silent floating devil can appear more often.
- Sound is opt-in (default muted), with separate normal/SPECIAL X/devil effects.
- Every card can be skipped.

PURCHASE / ACCESS
- Direct purchase for all packs and X COMPLETE.
- Buyer email is required before Stripe Checkout.
- Stripe Checkout success/cancel URLs use https://datenight.mrgreysroom.sk.
- Signed Stripe webhook writes paid entitlements to Supabase.
- success.html independently verifies the paid Stripe session and writes entitlement as a fallback.
- My Games uses Supabase Magic Link and RLS-protected entitlements.
- X COMPLETE unlocks every pack plus MIX MODE.

EMAIL / CRM
- Demo email capture syncs to MailerLite but never blocks demo if MailerLite is down.
- Marketing consent is optional and explicit.
- Paid customer CRM sync never blocks game entitlement.
- Auth/Magic Link delivery is handled by Supabase SMTP and must be tested separately.

VERCEL ENVIRONMENT VARIABLES
STRIPE_SECRET_KEY
STRIPE_PRICE_ROMANTIC
STRIPE_PRICE_SECRETS
STRIPE_PRICE_DARE
STRIPE_PRICE_AFTERDARK
STRIPE_PRICE_COMPLETE
STRIPE_WEBHOOK_SECRET
SUPABASE_SECRET_KEY
MAILERLITE_API_TOKEN

FINAL DOMAIN
https://datenight.mrgreysroom.sk

IMPORTANT BEFORE PAID TRAFFIC
1. Deploy this exact NORMAL ZIP (JS files remain .js).
2. Add all environment variables and redeploy.
3. Move datenight.mrgreysroom.sk to this project.
4. Verify one real Stripe purchase opens Checkout.
5. Verify the paid entitlement appears in Supabase / My Games.
6. Verify Magic Link reaches a real Gmail inbox and opens My Games.
7. Test on iPhone.
8. Only then start paid traffic.
