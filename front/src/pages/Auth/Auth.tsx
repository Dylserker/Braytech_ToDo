import AuthForm from '../../components/AuthForm/AuthForm'
import './Auth.css'

type AuthProps = {
  mode: 'login' | 'register'
}

function Auth({ mode }: AuthProps) {
  const isRegister = mode === 'register'

  return (
    <div className="auth-page">
      <main className="auth-page__main">
        <div className="auth-page__panel">
          <a className="auth-page__brand" href="/" aria-label="Braytech ToDo - accueil">
            <span className="auth-page__brand-mark" aria-hidden="true">
              <span className="auth-page__brand-ring" />
              <span className="auth-page__brand-core" />
              <span className="auth-page__brand-spark">✦</span>
            </span>
            <span className="auth-page__brand-copy">
              <strong>BRAYTECH ToDo</strong>
              <span>EXOSCIENCE / SYSTEMS</span>
            </span>
          </a>
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
    </div>
  )
}

export default Auth
