# Mastograd Studio — PicsArt AI Filteri & Napredna Dečija Bojanka

Kompletna kreativna platforma koja objedinjuje:
1. **PicsArt AI & 7-Phase Master Studio** — Profesionalna transformacija fotografija u ilustracije (Comic Book Pro, Hero Concept Art, Painterly Comic, Bearman Style Reference, Product-Safe mod za BEAR Underwear sa zaštitnom maskom za šapu sa 5 prstiju).
2. **Napredna Kreativna Dečija Bojanka** — Interaktivni studio za bojenje i crtanje za decu sa velikom paletom boja, otvorenom bibliotekom šablona i naprednim konvertorom fotografija u bojanku.

---

## 🖍️ Funkcionalnosti Napredne Dečije Bojanke

### 1. Napredni Konvertor Fotografije u Bojanku (Leak-Free Line Art)
- **Problem klasičnih filtera**: prekinute ili nejasne linije uzrokuju curenje boje (flood fill leak) na celu sliku.
- **Naše rešenje**:
  - Višestruko bilateralno i SNN peglanje teksture kože, trave i šuma.
  - Scharr 3×3 + DoG (Difference of Gaussians) ekstrakcija oštrih kontura.
  - **Morphological Closing & Gap-Closing algoritam**: automatski premošćava i zatvara procepe i praznine na linijama (0–3px radijus), formirajući 100% zatvorene oblasti za bojenje.
  - Interaktivno podešavanje: Oštrina/Prag, Debljina linija, Zatvaranje rupa i Uklanjanje šuma, sa live pregledom pre ubacivanja u bojanku.

### 2. Alati za Bojenje i Crtanje
- **🪣 Kantica (Scanline Flood Fill)**: Trenutno bojenje zatvorenih površina. Pametni *bleed* algoritam širi boju 1.5px ispod crnih linija, uklanjajući bele rubove i praznine.
- **🖍️ Glatki Flomaster**: Kvadratna Bézier interpolacija pokreta prsta/miša za prirodne, glatke poteze flomasterom sa izborom 4 debljine (Tanka, Srednja, Debela, Jumbo).
- **⭐ Osnovni Geometrijski Oblici**: Dodavanje i crtanje oblika:
  - Krug / Elipsa
  - Pravougaonik / Kvadrat
  - Trougao
  - Zvezda (5 krakova)
  - Srce
  - Prava linija
  - Opcija: *Ispunjeno* ili *Samo linija*.
- **🧹 Gumica**: Briše samo nanete boje, dok crne konture bojanke ostaju 100% netaknute.

### 3. Veliki Izbor Boja
- **🌈 Duga (Živa dečija paleta)**: 24 vedre, zasićene boje.
- **🍦 Pastel**: 16 nežnih pastelnih nijansi.
- **🦄 Neon**: 12 blistavih neonskih tonova.
- **🐻 Priroda**: 16 zemljanih tonova, tonova krzna, drveta i kože.
- **🎨 Custom Color Picker**: Neograničen izbor bilo koje RGB/Hex nijanse.

### 4. Otvorena Biblioteka Slika za Bojanje
Ugrađene čiste vektorske stranice optimizovane za decu, podeljene po kategorijama:
- **🦁 Životinje**: Veseli lavić, Mali T-Rex dinosaur...
- **🦸 Crtani & Heroji**: Bearman junak (sa 5 prstiju)...
- **🚗 Vozila**: Brzi sportski trkački auto...
- **🦄 Bajke & Magija**: Magični jednorog sa zvezdicama...
- **🌸 Priroda & Mandala**: Cvetna mandala za opuštajuće bojenje...

### 5. Dvoslojni Canvas & Responzivnost
- Boje se crtaju na donjem sloju, a crne linije se nalaze na gornjem sloju sa `multiply` modom, garantujući da linije nikada neće biti zamrljane ili prebrisane.
- `touch-action: none` sprečava neželjeno skrolovanje ekrana na telefonima i tabletima.
- Neograničeni **Undo / Redo**, dugme **Očisti**, **Štampaj (Print)** za štampanje prazne bojanke na papiru, i **Sačuvaj (PNG)**.

---

## 🚀 Pokretanje
Otvorite `index.html` direktno u pregledaču (dvoklikom, radi i preko `file://` protokola na Desktopu i mobilnim uređajima).
U vrhu stranice prebacujte se između **✨ PicsArt AI Studio** i **🖍️ Dečija Bojanka**, ili kliknite **"Pošalji u Bojanku"** da trenutnu AI sliku odmah pretvorite u stranicu za bojenje!
