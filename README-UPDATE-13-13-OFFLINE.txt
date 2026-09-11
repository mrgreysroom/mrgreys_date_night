MR GREY'S DATE NIGHT — UPDATE 13.13 — RELIABLE OFFLINE PLAY

WHAT THIS UPDATE DOES
- Purchased games can be played without internet after one successful online verification.
- Account page stores only the minimum local entitlement snapshot required for offline access.
- Offline access is renewed automatically whenever My Games / the game successfully verifies online.
- Offline entitlement is valid for 30 days from the latest successful online verification.
- Logging out removes the offline entitlement from that device.
- Service Worker caches the game shell, all language card data and core assets.
- Game no longer depends on loading the Supabase JavaScript SDK when opening play.html, which makes offline launch much more reliable.
- If online verification temporarily fails but a valid offline entitlement exists, the game still starts.
- API/auth/checkout requests are never cached.

FILES IN THIS UPDATE
- account.html
- play.html
- service-worker.js
- offline.html
- manifest.webmanifest
- vercel.json

DEPLOY
1. Copy these files into the ROOT of the existing MR GREY'S DATE NIGHT repository and replace files with the same name.
2. Commit and push to the branch deployed by Vercel.
3. Wait for the Vercel deployment to finish.
4. On iPhone, open My Games while ONLINE and log in normally.
5. Wait until Offline hranie says the device is prepared, or tap PRIPRAVIŤ HRU OFFLINE.
6. Open at least one purchased game once while online.
7. Turn on Airplane Mode (Wi-Fi and mobile data off).
8. Re-open the same /play.html?pack=... URL or launch it from browser history / saved Home Screen icon.
9. Verify cards advance, shuffle works, MIX works for COMPLETE and images/devil remain available.

IMPORTANT RELIABILITY NOTES
- The browser must not be in Private/Incognito mode. Private browsing can purge storage/cache.
- iOS may evict website storage if the device is critically low on storage or the site has not been used for a long time. Adding the site to Home Screen improves the app-like experience but web storage can still be managed by iOS.
- First-time login and purchase verification always require internet.
- After 30 days without any successful online verification, the user must connect once to renew offline access.
- Do not cache or move Stripe/Supabase API calls into the Service Worker.
