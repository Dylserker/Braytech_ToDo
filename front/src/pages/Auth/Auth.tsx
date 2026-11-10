import AuthForm from '../../components/AuthForm/AuthForm'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import './Auth.css'

type AuthProps = {
  mode: 'login' | 'register'
}

function Auth({ mode }: AuthProps) {
  const isRegister = mode === 'register'

  return (
    <div className="auth-page">
      <Header />
      <main className="auth-page__main">
        <div className="auth-page__panel">
          <p className="auth-page__eyebrow">
            BRAYTECH / {isRegister ? 'ENREGISTREMENT' : 'AUTHENTIFICATION'}
          </p>
          <h1>{isRegister ? 'Créer un accès' : 'Connexion'}</h1>
          <p className="auth-page__intro">
            {isRegister
              ? 'Initialisez votre profil pour synchroniser vos missions.'
              : 'Identifiez-vous pour retrouver votre centre de contrôle.'}
          </p>
          <AuthForm mode={mode} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Auth
