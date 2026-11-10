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
        <a className="header-nav__link header-nav__link--active" href="#planning">
          <span className="header-nav__index">01</span>
          Planning
        </a>
        <a className="header-nav__link" href="#succes">
          <span className="header-nav__index">02</span>
          Succès
        </a>
        <a className="header-nav__link" href="#contact">
          <span className="header-nav__index">03</span>
          Contact
        </a>
      </nav>

      <div className="header-status" aria-label="Système opérationnel">
        <span className="header-status__dot" />
        <span className="header-status__label">SYSTÈME EN LIGNE</span>
        <span className="header-status__code">BT-07</span>
      </div>
    </header>
  )
}

export default Header