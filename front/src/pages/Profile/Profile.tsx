import { useEffect, useState } from 'react'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import { apiRequest } from '../../functions/api'
import './Profile.css'

type Theme = {
  id: string
  name: string
  accent: string
  accentStrong: string
  background: string
  surface: string
}

type Character = {
  classType: number | null
  light: number | null
  emblemUrl: string | null
}

type Session = {
  profile?: {
    displayName: string
    profilePictureUrl: string | null
  } | null
}

const themes: Theme[] = [
  { id: 'braytech', name: 'Braytech', accent: '#52c3b0', accentStrong: '#e98125', background: '#0b1519', surface: '#101b20' },
  { id: 'void', name: 'Néant', accent: '#a18cff', accentStrong: '#e66cff', background: '#111021', surface: '#19152b' },
  { id: 'solar', name: 'Solaire', accent: '#ffb35c', accentStrong: '#ef684f', background: '#1b1411', surface: '#271a16' },
  { id: 'arc', name: 'Foudre', accent: '#73c8ff', accentStrong: '#d3e84f', background: '#0d1922', surface: '#142532' },
]

const classNames: Record<number, string> = {
  0: 'Titan',
  1: 'Chasseur',
  2: 'Arcaniste',
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.style.setProperty('--profile-accent', theme.accent)
  root.style.setProperty('--profile-accent-strong', theme.accentStrong)
  root.style.setProperty('--profile-background', theme.background)
  root.style.setProperty('--profile-surface', theme.surface)
}

function Profile() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('braytech-profile-theme')
    return themes.find((item) => item.id === savedTheme) ?? themes[0]
  })
  const [session, setSession] = useState<Session | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [seasonRank, setSeasonRank] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('braytech-profile-theme', theme.id)
  }, [theme])

  useEffect(() => {
    Promise.all([apiRequest('/auth/bungie/session'), apiRequest('/auth/bungie/characters')])
      .then(async ([sessionResponse, charactersResponse]) => {
        setSession(await sessionResponse.json() as Session)
        const payload = await charactersResponse.json() as { characters: Character[], seasonRank: number | null }
        setCharacters(payload.characters)
        setSeasonRank(payload.seasonRank)
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Les données Bungie sont indisponibles')
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-page__main">
        <p className="profile-page__eyebrow">BRAYTECH / IDENTITÉ</p>
        <h1>Mon profil</h1>

        <section className="profile-card profile-card--identity" aria-labelledby="profile-title">
          <div className="profile-card__identity">
            <img
              className="profile-card__photo"
              src={session?.profile?.profilePictureUrl ?? '/profile-avatar.svg'}
              alt="Photo de profil Bungie"
            />
            <div>
              <p className="profile-card__eyebrow">PROFIL / BUNGIE</p>
              <h2 id="profile-title">{session?.profile?.displayName ?? 'Gardien Braytech'}</h2>
              <p className="profile-card__status">Photo et identité synchronisées avec Bungie</p>
            </div>
          </div>
        </section>

        <section className="profile-card" aria-labelledby="theme-title">
          <div className="profile-card__section-heading">
            <div>
              <p className="profile-card__eyebrow">PERSONNALISATION</p>
              <h2 id="theme-title">Couleurs du compte</h2>
            </div>
            <span className="profile-card__hint">Enregistrées automatiquement</span>
          </div>
          <div className="profile-themes">
            {themes.map((item) => (
              <button
                className={`profile-theme ${theme.id === item.id ? 'is-selected' : ''}`}
                key={item.id}
                type="button"
                onClick={() => setTheme(item)}
                aria-pressed={theme.id === item.id}
              >
                <span className="profile-theme__swatch" style={{ background: `linear-gradient(135deg, ${item.accent}, ${item.accentStrong})` }} />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="profile-card" aria-labelledby="guardians-title">
          <div className="profile-card__section-heading">
            <div>
              <p className="profile-card__eyebrow">DONNÉES BUNGIE</p>
              <h2 id="guardians-title">Vos personnages</h2>
            </div>
            <span className="profile-card__season">RANG SAISONNIER {seasonRank ?? '—'}</span>
          </div>
          {isLoading && <p className="profile-card__message">Synchronisation des personnages...</p>}
          {error && <p className="profile-card__message" role="alert">{error}</p>}
          {!isLoading && !error && characters.length === 0 && (
            <p className="profile-card__message">Aucun personnage Bungie disponible.</p>
          )}
          <div className="character-grid">
            {characters.map((character, index) => (
              <article className="character-card" key={`${character.classType}-${index}`}>
                {character.emblemUrl && <img src={character.emblemUrl} alt="" className="character-card__emblem" />}
                <div className="character-card__content">
                  <p className="profile-card__eyebrow">PERSONNAGE {String(index + 1).padStart(2, '0')}</p>
                  <h3>{character.classType === null ? 'Gardien' : classNames[character.classType] ?? 'Gardien'}</h3>
                  <strong>{character.light ?? '—'} <small>LUMIÈRE</small></strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Profile
