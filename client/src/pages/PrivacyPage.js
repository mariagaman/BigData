import React from 'react';
import '../styles/TermsPrivacy.css';

const PrivacyPage = () => {
  return (
    <div className="terms-privacy-page">
      <div className="terms-privacy-container">
        <div className="terms-privacy-header">
          <h1>Politica de Confidențialitate</h1>
          <p className="last-updated">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
        </div>

        <div className="terms-privacy-content">
          <section>
            <h2>1. Introducere</h2>
            <p>
              RailMate respectă confidențialitatea utilizatorilor și se angajează să protejeze datele personale colectate 
              în conformitate cu Regulamentul General privind Protecția Datelor (GDPR) și legislația română aplicabilă.
            </p>
          </section>

          <section>
            <h2>2. Datele Colectate</h2>
            <p>Colectăm următoarele tipuri de date personale:</p>
            <ul>
              <li><strong>Date de identificare:</strong> nume, prenume, adresă de email, număr de telefon</li>
              <li><strong>Date de plată:</strong> informații despre metodele de plată (procesate securizat prin intermediari autorizați)</li>
              <li><strong>Date de utilizare:</strong> istoricul rezervărilor, preferințele de călătorie</li>
              <li><strong>Date tehnice:</strong> adresa IP, tipul de browser, dispozitivul utilizat</li>
            </ul>
          </section>

          <section>
            <h2>3. Scopul Colectării Datelor</h2>
            <p>Datele dvs. personale sunt utilizate pentru:</p>
            <ul>
              <li>Procesarea și gestionarea rezervărilor</li>
              <li>Comunicarea despre rezervări și actualizări</li>
              <li>Îmbunătățirea serviciilor noastre</li>
              <li>Conformarea cu obligațiile legale</li>
              <li>Prevenirea fraudelor și abuzurilor</li>
            </ul>
          </section>

          <section>
            <h2>4. Baza Legală pentru Prelucrare</h2>
            <p>
              Prelucrăm datele dvs. personale pe baza următoarelor motive legale:
            </p>
            <ul>
              <li>Executarea contractului (procesarea rezervărilor)</li>
              <li>Consimțământul dvs. (pentru marketing și comunicări)</li>
              <li>Obligații legale (conformarea cu cerințele legale)</li>
              <li>Interese legitime (îmbunătățirea serviciilor)</li>
            </ul>
          </section>

          <section>
            <h2>5. Partajarea Datelor</h2>
            <p>
              Datele dvs. pot fi partajate cu:
            </p>
            <ul>
              <li><strong>Operatorii de transport:</strong> pentru procesarea rezervărilor</li>
              <li><strong>Furnizorii de servicii de plată:</strong> pentru procesarea plăților</li>
              <li><strong>Furnizorii de servicii IT:</strong> pentru hosting și suport tehnic</li>
              <li><strong>Autoritățile:</strong> când este cerut de lege</li>
            </ul>
            <p>
              Nu vindem datele dvs. personale către terți în scopuri de marketing.
            </p>
          </section>

          <section>
            <h2>6. Securitatea Datelor</h2>
            <p>
              Implementăm măsuri tehnice și organizaționale adecvate pentru a proteja datele dvs. personale împotriva 
              accesului neautorizat, pierderii sau distrugerii. Acestea includ:
            </p>
            <ul>
              <li>Criptarea datelor sensibile</li>
              <li>Acces restricționat la date</li>
              <li>Monitorizare continuă a securității</li>
              <li>Actualizări regulate de securitate</li>
            </ul>
          </section>

          <section>
            <h2>7. Stocarea Datelor</h2>
            <p>
              Păstrăm datele dvs. personale doar atât timp cât este necesar pentru scopurile pentru care au fost colectate, 
              sau conform cerințelor legale. După expirarea perioadei de păstrare, datele sunt șterse sau anonimizate în siguranță.
            </p>
          </section>

          <section>
            <h2>8. Drepturile Dvs.</h2>
            <p>Conform GDPR, aveți următoarele drepturi:</p>
            <ul>
              <li><strong>Dreptul de acces:</strong> puteți solicita o copie a datelor dvs. personale</li>
              <li><strong>Dreptul la rectificare:</strong> puteți corecta datele inexacte</li>
              <li><strong>Dreptul la ștergere:</strong> puteți solicita ștergerea datelor în anumite circumstanțe</li>
              <li><strong>Dreptul la restricționare:</strong> puteți restricționa prelucrarea datelor</li>
              <li><strong>Dreptul la portabilitate:</strong> puteți solicita transferul datelor</li>
              <li><strong>Dreptul de opoziție:</strong> puteți vă opune anumitor tipuri de prelucrare</li>
              <li><strong>Dreptul de retragere a consimțământului:</strong> puteți retrage consimțământul oricând</li>
            </ul>
          </section>

          <section>
            <h2>9. Cookie-uri</h2>
            <p>
              Utilizăm cookie-uri pentru a îmbunătăți experiența dvs. pe platformă. Cookie-urile ne ajută să vă 
              recunoaștem când reveniți și să personalizăm serviciile. Puteți gestiona preferințele pentru cookie-uri 
              în setările browserului dvs.
            </p>
          </section>

          <section>
            <h2>10. Modificări ale Politicii</h2>
            <p>
              Ne rezervăm dreptul de a actualiza această Politică de Confidențialitate. 
              Vă vom notifica despre modificări semnificative prin email sau prin notificări pe platformă.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              Pentru întrebări despre prelucrarea datelor dvs. personale sau pentru a exercita drepturile dvs., 
              vă rugăm să ne contactați la adresa de email dedicată protecției datelor sau prin intermediul 
              secțiunii de contact de pe platformă.
            </p>
            <p>
              De asemenea, aveți dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării 
              Datelor cu Caracter Personal (ANSPDCP) dacă considerați că prelucrarea datelor dvs. încalcă legislația aplicabilă.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

