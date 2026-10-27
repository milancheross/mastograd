# Mastograd — Napredna Kreativna Bojanka za Decu

Kompletna, moderna i responzivna digitalna bojanka za decu, prilagođena za udobno korišćenje i na Desktop računarima i na telefonima/tabletima.

---

## 🖍️ Glavne Funkcionalnosti

### 1. 🪣 Kantica za Bojenje (Scanline Flood Fill)
- Trenutno i precizno bojenje zatvorenih površina.
- Pametni prelazni algoritam širi boju 1.5px ispod crnih linija tako da **nema belih praznina, rubova ili oreola** oko kontura.

### 2. 🖍️ Glatki Flomaster
- Prirodan i tečan osećaj crtanja rukom zahvaljujući kvadratnoj Bézier interpolaciji poteza.
- Izbor 4 veličine vrha: *Tanka (6px), Srednja (14px), Debela (28px) i Jumbo (44px)*.

### 3. ⭐ Osnovni Geometrijski Oblici
- Brzo dodavanje i crtanje oblika prevlačenjem:
  - **⭕ Krug / Elipsa**
  - **⬛ Pravougaonik / Kvadrat**
  - **▲ Trougao**
  - **⭐ Zvezda (5 krakova)**
  - **❤️ Srce**
  - **➖ Prava linija**
- Prekidač: *Ispunjeno oblikom (Fill)* ili *Samo linija (Stroke)*.

### 4. 🧹 Gumica za Brisanje
- Briše samo nanete boje i flomaster, dok su crne linije bojanke 100% zaštićene na odvojenom sloju i nikada se ne mogu oštetiti.

### 5. 🎨 Veliki Izbor Boja
- **🌈 Duga (Živa dečija paleta)**: 24 vedre, vesele boje.
- **🍦 Pastel**: 16 nežnih pastelnih nijansi.
- **🦄 Neon**: 12 blistavih neonskih tonova.
- **🐻 Priroda**: 16 zemljanih tonova, tonova krzna, drveta i peska.
- **🎨 Bilo koja boja**: HTML5 birač za neograničen izbor bilo koje RGB/Hex nijanse.

### 6. 📚 Otvorena Biblioteka Slika za Bojanje
Ugrađene čiste, zatvorene vektorske stranice optimizovane za kanticu, podeljene po kategorijama:
- **🦁 Životinje**: Veseli lavić, Mali T-Rex dinosaur...
- **🦸 Crtani & Heroji**: Bearman junak (sa 5 prstiju)...
- **🚗 Vozila**: Brzi sportski auto sa trkačkim trakama...
- **🦄 Bajke & Magija**: Magični jednorog sa zvezdicama...
- **🌸 Priroda & Mandala**: Cvetna mandala za opuštajuće bojenje...

### 7. 📷 Napredno Pravljenje Bojanke od Fotografije (Leak-Free Line Art)
- Pretvara bilo koju fotografiju u čistu stranicu za bojanje.
- **Zatvaranje rupa i procepa (`Gap Closing`)**: morfološko premošćavanje linija garantuje zatvorene konture tako da se boja iz kante ne preliva u susedne delove.
- Podešavanje oštrine/praga, debljine linija, zatvaranja rupa i uklanjanja šuma sa prikazom uživo pre prihvatanja.

### 8. 📱 Responzivan Dizajn za Desktop & Mobile
- `touch-action: none` sprečava neželjeno skrolovanje tokom crtanja na telefonima i tabletima.
- Neograničeni **Undo / Redo**, dugme **Očisti (🗑️)**, **Štampaj (🖨️)** za štampu crteža na papiru i **Sačuvaj (💾)** za preuzimanje u PNG formatu.

---

## 🚀 Pokretanje
Otvorite `index.html` direktno u pregledaču (dvoklikom, radi i preko `file://` protokola).
