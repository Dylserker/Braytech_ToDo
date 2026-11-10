import type { ReactNode } from 'react'
import './Cards.css'

type CardProps = {
  eyebrow?: string
  title: string
  meta?: string
  children?: ReactNode
  actions?: ReactNode
}

function Card({ eyebrow, title, meta, children, actions }: CardProps) {
  return (
    <article className="bray-card">
      <div className="bray-card__header">
        <div>
          {eyebrow && <p className="bray-card__eyebrow">{eyebrow}</p>}
          <h3>{title}</h3>
        </div>
        {meta && <span className="bray-card__meta">{meta}</span>}
      </div>
      {children && <div className="bray-card__body">{children}</div>}
      {actions && <div className="bray-card__actions">{actions}</div>}
    </article>
  )
}

export default Card