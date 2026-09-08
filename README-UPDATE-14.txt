MR GREY'S WORLD — UPDATE 14 — DESIRE MARKETING OPT-IN

ČO SA MENÍ
- Marketingový checkbox v DESIRE zostáva predvolene nezaškrtnutý a dobrovoľný.
- Text checkboxu je benefit-driven: nové testy, príbehy, hry a výhody MR GREY'S.
- Jasne uvádza možnosť kedykoľvek súhlas odvolať.
- Rovnaký text je zjednotený aj pri partnerovej časti DESIRE.
- Po dokončení testu sa ľuďom, ktorí marketingový súhlas ešte nedali, zobrazí druhá dobrovoľná výzva „ÁNO, CHCEM ĎALŠÍ TEST →“.
- Nový serverový endpoint /api/marketing-consent uloží súhlas do Supabase marketing_leads bez vytvárania novej DESIRE session.
- marketing_consent=true sa uloží iba po aktívnom kliknutí používateľa.

NOVÝ SÚBOR
- app/api/marketing-consent/route.js

UPRAVENÉ SÚBORY
- app/desire/page.js
- app/desire/partner/page.js
- app/desire/deep/partner/PartnerClient.js
- app/desire/test/page.js
- app/globals.css

DEPLOY
Nahraj celý obsah ZIPu do koreňa repozitára MR-GREYS-WORLD rovnako ako pri predchádzajúcich updateoch a commitni. Vercel následne nasadí novú verziu.

ODPORÚČANÝ COMMIT
Update 14: improve DESIRE marketing opt-in conversion
