import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import ContactForm from '../../components/ContactForm/ContactForm'
import './Contact.css'

function Contact() {
  return (
    <div id="top" className="contact-page">
      <Header />
      <main className="contact">
        <p className="contact__eyebrow">BRAYTECH / TRANSMISSION</p>
        <div className="contact__heading">
          <div>
            <h1>Contactez-nous</h1>
            <p className="contact__intro">
              Une question, un retour ou un signalement ? Transmettez votre message à notre équipe.
            </p>
          </div>
          <span className="contact__code">CANAL BT-03 / ACTIF</span>
        </div>

        <div className="contact__layout">
          <section className="contact__panel" aria-labelledby="contact-form-title">
            <div className="contact__panel-heading">
              <p>01 / NOUVELLE TRANSMISSION</p>
              <h2 id="contact-form-title">Écrire un message</h2>
            </div>
            <ContactForm />
          </section>

          <aside className="contact__aside">
            <p className="contact__aside-eyebrow">02 / COORDONNÉES</p>
            <h2>Le relais Braytech</h2>
            <p>
              Notre équipe est disponible pour vous accompagner dans l’utilisation de votre centre de contrôle.
            </p>
            <a href="mailto:contact@braytech.todo">contact@braytech.todo</a>
            <div className="contact__signal">
              <span className="contact__signal-dot" />
              Temps de réponse habituel : 24 à 48 h
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Contact
