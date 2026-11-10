import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import './AuthForm.css'

type AuthMode = 'login' | 'register'

type AuthFormProps = {
  mode: AuthMode
}

function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const isRegister = mode === 'register'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    if (isRegister && formData.get('password') !== formData.get('passwordConfirmation')) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    navigate('/')
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister && (
        <label>
          Identifiant
          <input name="username" type="text" autoComplete="username" required />
        </label>
      )}
      <label>
        Adresse e-mail
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Mot de passe
        <input name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required />
      </label>
      {isRegister && (
        <label>
          Confirmer le mot de passe
          <input name="passwordConfirmation" type="password" autoComplete="new-password" required />
        </label>
      )}
      {error && (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      )}
      <button className="auth-form__submit" type="submit">
        {isRegister ? 'Créer mon accès' : 'Ouvrir ma session'}
      </button>
      <p className="auth-form__redirect">
        {isRegister ? 'Déjà membre ?' : 'Pas encore de compte ?'}{' '}
        <Link to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Se connecter' : 'Créer un compte'}
        </Link>
      </p>
    </form>
  )
}

export default AuthForm
