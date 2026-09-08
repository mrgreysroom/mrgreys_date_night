# MR GREY’S DATE NIGHT — V13 MULTILINGUAL COMPLETE

One merge/overwrite update for the existing Date Night repository. **Do not delete files that are not present in this ZIP** (especially existing `/assets` and unchanged Stripe/Supabase endpoints such as webhook/confirm-purchase).

## Languages
- SK — Slovak (default/fallback)
- CZ — Czech
- PL — Polish
- EN — English

## Content
- Romantic: 70 cards
- Secrets: 100 cards
- Dare: 100 cards
- After Dark: 100 cards
- Total: 370 cards per language / 1,480 localized card texts
- Card type, SPECIAL X positions, special metadata and deck order are identical in every language.

## Language behavior
Priority: `?lang=sk|cz|pl|en` → saved MR GREY’S language → browser language → SK. The choice is saved in `localStorage` under `mrgreys_language` and `mrg_language`. Browser `cs` maps to product code `cz`.

MR GREY’S WORLD can deep-link with e.g. `https://datenight.mrgreysroom.sk/?lang=pl`.

Language is propagated into demo lead API, marketing CRM and Stripe Checkout metadata. Stripe success/cancel URLs preserve the language. A purchase is language-independent: the same entitlement unlocks the deck in all four languages.

## Upload
Extract this ZIP over the current Git repository and commit all changed/new files. Keep your existing `/assets`, `/api/stripe-webhook.js`, `/api/confirm-purchase.js` and any other production-only files that are not included here.

## Production checks still required
1. Existing Vercel environment variables remain configured.
2. Real Stripe checkout succeeds and entitlement appears in My Games.
3. Supabase Magic Link reaches a real inbox and authenticates correctly.
4. Test SK/CZ/PL/EN on iPhone/mobile.
5. Verify all existing assets (`assets/mrgreys-x.jpg`, `assets/devil-x.png`) remain in repo.

**Known pre-existing blocker:** V12 launch notes said Magic Link delivery to Gmail had not yet been proven. V13 does not change SMTP infrastructure; verify it before paid traffic.

## Supabase Magic Link email
`SUPABASE_MAGIC_LINK_EMAIL_TEMPLATE_MULTILINGUAL.html` is included as a safe universal SK/CZ/PL/EN fallback template. Supabase Auth's standard single template is not selected from browser localStorage automatically; true per-user auth-email language would require a locale-aware custom Auth email hook. The marketing/nurture emails in `api/_marketing-mail.js` already select SK/CZ/PL/EN from the saved lead language.
