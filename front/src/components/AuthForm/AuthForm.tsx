import { Link } from 'react-router'
import './AuthForm.css'

type AuthMode = 'login' | 'register'

type AuthFormProps = {
  mode: AuthMode
}

function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === 'register'
  const bungieStatus = new URLSearchParams(window.location.search).get('bungie')
  const bungieStartUrl = 'https://localhost:3000/api/v1/auth/bungie/start'

  return (
    <div className="auth-form">
      <p className="auth-form__provider">
        {isRegister
          ? 'Votre compte Bungie sera utilisé pour créer votre espace Braytech ToDo.'
          : 'Connectez votre compte Bungie pour retrouver vos activités et votre progression.'}
      </p>
      {bungieStatus === 'error' && (
        <p className="auth-form__error" role="alert">
          La connexion Bungie n’a pas abouti. Vérifiez la redirection autorisée puis réessayez.
        </p>
      )}
      {bungieStatus === 'connected' && (
        <p className="auth-form__success" role="status">
          Compte Bungie connecté. Vous pouvez revenir à votre planning.
        </p>
      )}
      <a className="auth-form__submit" href={bungieStartUrl}>
        Continuer avec Bungie
      </a>
      <p className="auth-form__redirect">
        {isRegister ? 'Déjà membre ?' : 'Vous souhaitez créer un espace ?'}{' '}
        <Link to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Se connecter' : 'Commencer'}
        </Link>
      </p>
    </div>
  )
}

export default AuthForm
