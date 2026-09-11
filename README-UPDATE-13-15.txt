MR GREY'S DATE NIGHT — UPDATE 13.15 LOGIN SESSION FIX

Oprava prihlasovania po Magic Linku:
- odstránené riziko deadlocku v onAuthStateChange
- po úspešnom prihlásení sa použije session user a zobrazia sa zakúpené hry
- zrozumiteľnejšia hláška pri rate limite
- upozornenie, aby používateľ otvoril najnovší prihlasovací e-mail

Nasadenie:
1. Nahraďte account.html v koreňovom priečinku projektu.
2. Commit/push do main.
3. Počkajte na Vercel production deployment.
4. Odhlásiť sa -> vyžiadať nový link -> kliknúť na najnovší e-mail -> po návrate sa majú automaticky zobraziť zakúpené hry.
