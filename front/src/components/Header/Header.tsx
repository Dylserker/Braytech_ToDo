import ProgressBar from '../ProgressBar/ProgressBar'
import './Header.css'

function Header() {
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
              <img src="/profile-avatar.svg" alt="" />
            </span>
          </a>
          <div className="profile-menu__details">
            <div className="profile-menu__identity">
              <strong>Gardien Braytech</strong>
              <span>NIVEAU 07</span>
            </div>
            <ProgressBar value={720} max={1000} label="XP" />
          </div>
          <a className="profile-menu__logout" href="/login">Déconnexion</a>
        </div>
      </div>
    </header>
  )
}

export default Header