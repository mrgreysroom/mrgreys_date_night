MR GREY'S DATE NIGHT — UPDATE 13.14 AUTH EMAIL FIX

1. account.html
- offline režim sa už nespúšťa automaticky po prihlásení
- používateľ ho spúšťa vedome tlačidlom
- text prihlasovacieho tlačidla je zrozumiteľnejší

2. SUPABASE_MAGIC_LINK_TEMPLATE.html
- vložiť obsah do Supabase Dashboard > Authentication > Emails > Magic Link
- šablóna obsahuje povinné {{ .ConfirmationURL }}
- po uložení vyžiadať nový prihlasovací e-mail a otestovať ho na Gmaili

DÔLEŽITÉ:
Bez uloženia Magic Link šablóny v Supabase sa problém prázdneho prihlasovacieho e-mailu neopraví.
Staré už odoslané e-maily sa nezmenia; zákazník si musí vyžiadať nový link.
