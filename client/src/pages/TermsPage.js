import React from 'react';
import '../styles/TermsPrivacy.css';

const TermsPage = () => {
  return (
    <div className="terms-privacy-page">
      <div className="terms-privacy-container">
        <div className="terms-privacy-header">
          <h1>Termeni și Condiții</h1>
          <p className="last-updated">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
        </div>

        <div className="terms-privacy-content">
          <section>
            <h2>1. Acceptarea Termenilor</h2>
            <p>
              Prin accesarea și utilizarea platformei RailMate, acceptați să respectați și să fiți obligați de acești Termeni și Condiții.
              Dacă nu sunteți de acord cu oricare dintre termenii prezentați, vă rugăm să nu utilizați serviciile noastre.
            </p>
          </section>

          <section>
            <h2>2. Descrierea Serviciilor</h2>
            <p>
              RailMate este o platformă online care permite utilizatorilor să rezerve și să cumpere bilete de tren.
              Oferim servicii de intermediere între utilizatori și operatorii de transport feroviar.
            </p>
          </section>

          <section>
            <h2>3. Crearea Contului</h2>
            <p>
              Pentru a utiliza serviciile noastre, trebuie să vă creați un cont. Sunteți responsabil pentru:
            </p>
            <ul>
              <li>Păstrarea confidențialității informațiilor de conectare</li>
              <li>Toate activitățile care au loc sub contul dvs.</li>
              <li>Furnizarea de informații corecte și actualizate</li>
            </ul>
          </section>

          <section>
            <h2>4. Rezervări și Plăți</h2>
            <p>
              Rezervările sunt supuse disponibilității și confirmării de către operatorul de transport.
              Plățile trebuie efectuate conform metodelor acceptate de platformă.
              Prețurile pot varia și sunt afișate în timp real.
            </p>
          </section>

          <section>
            <h2>5. Anulări și Rambursări</h2>
            <p>
              Politica de anulare și rambursare depinde de operatorul de transport și de tipul biletului cumpărat.
              Vă rugăm să consultați condițiile specifice înainte de a finaliza rezervarea.
            </p>
          </section>

          <section>
            <h2>6. Responsabilități ale Utilizatorului</h2>
            <p>Utilizatorii sunt obligați să:</p>
            <ul>
              <li>Furnizeze informații corecte și complete</li>
              <li>Utilizeze platforma în conformitate cu legea</li>
              <li>Nu încercați să accesați sau să modificați sistemul</li>
              <li>Respecteze drepturile altor utilizatori</li>
            </ul>
          </section>

          <section>
            <h2>7. Proprietate Intelectuală</h2>
            <p>
              Toate conținuturile, design-ul, logo-urile și alte materiale de pe platformă sunt proprietatea RailMate
              sau a partenerilor noștri și sunt protejate de legile privind drepturile de autor.
            </p>
          </section>

          <section>
            <h2>8. Limitarea Răspunderii</h2>
            <p>
              RailMate nu poate fi considerat responsabil pentru întârzieri, anulări sau alte probleme care apar din cauza
              operatorilor de transport sau a altor circumstanțe independente de controlul nostru.
            </p>
          </section>

          <section>
            <h2>9. Modificări ale Termenilor</h2>
            <p>
              Ne rezervăm dreptul de a modifica acești Termeni și Condiții în orice moment.
              Modificările vor fi comunicate utilizatorilor și vor intra în vigoare imediat după publicare.
            </p>
          </section>

          <section>
            <h2>10. Legea Aplicabilă</h2>
            <p>
              Acești Termeni și Condiții sunt guvernați de legile României.
              Orice dispută va fi rezolvată de instanțele competente din România.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              Pentru întrebări sau nelămuriri privind acești Termeni și Condiții, vă rugăm să ne contactați
              prin intermediul secțiunii de contact de pe platformă.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

