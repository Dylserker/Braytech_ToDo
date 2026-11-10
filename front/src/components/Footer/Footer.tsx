import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__identity">
        <span className="site-footer__mark" aria-hidden="true">
          BT
        </span>
        <div>
          <strong>BRAYTECH ToDo</strong>
          <span>EXOSCIENCE / SYSTEMS</span>
        </div>
      </div>

      <p className="site-footer__copyright">
        © BRAYTECH INDUSTRIES
      </p>

      <a className="site-footer__top" href="#root">
        Retour en haut <span aria-hidden="true">↑</span>
      </a>
    </footer>
  )
}

export default Footer
