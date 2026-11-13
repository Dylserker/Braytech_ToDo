import { useEffect, useState } from 'react'
import ProgressBar from '../ProgressBar/ProgressBar'
import './Header.css'

type BungieSession = {
  authenticated: boolean
  profile?: {
    displayName: string
    profilePictureUrl: string | null
  } | null
  appProfile?: {
    level: number
    xp: number
    xpToNextLevel: number
  }
  memberships?: {
    bungieNetUser?: { displayName?: string }
    destinyMemberships?: Array<{ displayName?: string }>
  }
}

function Header() {
  const [session, setSession] = useState<BungieSession | null>(null)

  useEffect(() => {
    fetch('https://localhost:3000/api/v1/auth/bungie/session', { credentials: 'include' })
      .then((response) => response.ok ? response.json() as Promise<BungieSession> : null)
      .then((nextSession) => setSession(nextSession))
      .catch(() => setSession(null))
  }, [])

  const displayName = session?.profile?.displayName
    ?? session?.memberships?.bungieNetUser?.displayName
    ?? session?.memberships?.destinyMemberships?.[0]?.displayName
    ?? 'Gardien Braytech'
  const profilePictureUrl = session?.profile?.profilePictureUrl ?? '/profile-avatar.svg'
  const level = session?.appProfile?.level ?? 1
  const xp = session?.appProfile?.xp ?? 0
  const xpToNextLevel = session?.appProfile?.xpToNextLevel ?? 1000

  const handleLogout = async () => {
    await fetch('https://localhost:3000/api/v1/auth/bungie/logout', {
      credentials: 'include',
      method: 'POST',
    })
    window.location.assign('/login')
  }

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Braytech Exoscience - accueil">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-mark__ring" />
          <span className="brand-mark__core" />
          <span className="brand-mark__spark">✦</span>
        </span>
        <span className="brand-copy">
          <span className="brand-copy__name">BRAYTECH ToDo</span>
          <span className="brand-copy__division">EXOSCIENCE / SYSTEMS</span>
        </span>
      </a>

      <nav className="header-nav" aria-label="Navigation principale">
        <a className="header-nav__link header-nav__link--active" href="/planning">
          <span className="header-nav__index">01</span>
          Planning
        </a>
        <a className="header-nav__link" href="/achievements">
          <span className="header-nav__index">02</span>
          Succès
        </a>
        <a className="header-nav__link" href="/contact">
          <span className="header-nav__index">03</span>
          Contact
        </a>
      </nav>

      <div className="profile-menu">
        <div className="profile-menu__card">
            <a className="profile-menu__profile-link" href="/profile" aria-label="Accéder au profil">
            <span className="profile-menu__card-avatar">
              <img src={profilePictureUrl} alt="" />
            </span>
          </a>
          <div className="profile-menu__details">
            <div className="profile-menu__identity">
              <strong>{displayName}</strong>
              <span>NIVEAU {String(level).padStart(2, '0')}</span>
            </div>
            <ProgressBar value={xp} max={xpToNextLevel} label="XP" />
          </div>
          <button className="profile-menu__logout" type="button" onClick={handleLogout}>
            <span className="profile-menu__logout__icon" aria-hidden="true">⏻</span>
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header