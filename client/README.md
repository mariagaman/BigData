# RailMate - Aplicație pentru Rezervarea Biletelor de Tren

Aplicație web modernă pentru achiziționarea biletelor de tren în România, construită cu React. RailMate este partenerul tău de încredere pentru călătorii cu trenul.

## 🚀 Caracteristici

- **Căutare trenuri** - Caută trenuri disponibile între diferite orașe
- **Rezervare bilete** - Rezervă bilete pentru unul sau mai mulți pasageri
- **Gestionare rezervări** - Vizualizează și gestionează rezervările tale
- **Interfață modernă** - Design responsive și intuitiv
- **Filtrare și sortare** - Filtrează și sortează rezultatele după preferințe

## 📋 Cerințe

- Node.js (versiunea 14 sau mai nouă)
- npm sau yarn

## 🛠️ Instalare

1. Instalează dependențele:
```bash
npm install
```

2. Pornește aplicația în modul de dezvoltare:
```bash
npm start
```

3. Deschide [http://localhost:3000](http://localhost:3000) în browser pentru a vizualiza aplicația.

## 📦 Build pentru producție

Pentru a construi aplicația pentru producție:

```bash
npm run build
```

Acest command va crea un folder `build` cu fișierele optimizate pentru producție.

## 🎨 Structura Proiectului

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/       # Componente reutilizabile
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   ├── SearchForm.js
│   │   ├── TrainCard.js
│   │   ├── BookingSummary.js
│   │   └── PassengerForm.js
│   ├── pages/           # Pagini principale
│   │   ├── Home.js
│   │   ├── SearchResults.js
│   │   ├── BookingPage.js
│   │   ├── ConfirmationPage.js
│   │   └── MyBookings.js
│   ├── context/         # Context API pentru state management
│   │   └── BookingContext.js
│   ├── services/        # Servicii pentru API calls
│   │   └── api.js
│   ├── styles/          # Fișiere CSS
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🔧 Tehnologii Utilizate

- **React** - Librărie pentru construirea interfețelor
- **React Router** - Routing pentru aplicația single-page
- **Context API** - Gestionarea stării aplicației
- **CSS3** - Stilizare modernă și responsive

## 📱 Funcționalități

### Pagina Principală
- Hero section atrăgător
- Formular de căutare
- Caracteristici principale
- Rute populare

### Căutare Trenuri
- Filtrare după tip de tren
- Sortare după preț, oră, durată
- Afișare detalii complete despre trenuri

### Rezervare
- Completare detalii pasageri
- Selectare metodă de plată
- Rezumat călătorie

### Confirmarea Rezervării
- Detalii complete rezervare
- Număr unic de rezervare
- Descărcare bilete (în curând)

### Rezervările Mele
- Vizualizare toate rezervările
- Filtrare după status (viitoare/trecute)
- Anulare rezervări

## 🎯 Viitoare Îmbunătățiri

- [ ] Integrare cu backend real
- [ ] Sistem de plată efectiv
- [ ] Descărcare bilete în format PDF
- [ ] Notificări email
- [ ] Autentificare utilizatori
- [ ] Istoric plăți
- [ ] Suport multilingv

## 👨‍💻 Dezvoltat cu

Această aplicație a fost dezvoltată cu pasiune pentru a oferi o experiență excelentă utilizatorilor care călătoresc cu trenul în România.

## 📄 Licență

© 2025 RailMate. Toate drepturile rezervate.

