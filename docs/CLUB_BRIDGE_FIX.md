# Club → paid Date Night access fix

15 October 2026.

Root cause: World generated an auth action_link redirecting directly to play.html. The game read only an already persisted raw Supabase session and did not process a fresh URL login, so a new Club browser arrived without the game session. Allowed redirect fallback could also return the visitor to the sales landing page.

Fix:
- Verify signed World identity and stored complete entitlement before generating the login; ordinary membership alone grants no free Date Night access.
- Use generate_link hashed_token and the existing Date Night bridge landing. Fixed destination, one-time credential in URL fragment, no-store and no-referrer response. No provider action_link forwarded.
- Bridge removes fragment/legacy query credential before verifyOtp, persists session, then opens canonical /play with selected pack/language. Failed OTP stays on the error screen with a Club return link.
- Game uses pinned Supabase client to initialize/refresh the session before the RLS entitlement request. Same existing authenticated-own-email policy retained.
- Offline worker cache version bumped; canonical /play and /account paths included. No purchases or entitlements changed for the owner; existing signed internal role behaviour retained.

Verification:
- World bridge tests: unsigned login, paid-owner transfer, non-owner refusal, request identity ignored, fragment credential, provider error without checkout, no duplicate ownership write.
- Game bridge tests: fragment + legacy token, scrub-before-verify, failed OTP, pack allowlist, language/session preservation, refresh-before-query, cache bump.
- Rolled-back SQL: authenticated stranger sees no owner entitlements. Existing owner has complete entitlement.
- No new payment, no credential values included in source or output. Browser session specific end-to-end verification is separate from these automated checks.
