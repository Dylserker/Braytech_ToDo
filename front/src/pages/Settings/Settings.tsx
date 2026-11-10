import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import './Settings.css'

function Settings() {
  return (
    <div className="settings-page">
      <Header />
      <main className="settings-page__main">
        <p className="settings-page__eyebrow">BRAYTECH / CONFIGURATION</p>
        <h1>Paramètres</h1>
        <section className="settings-page__card">
          <h2>Préférences système</h2>
          <p>Les paramètres de votre centre de contrôle seront disponibles ici.</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Settings
