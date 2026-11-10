import type { ReactNode } from 'react'
import './PlanningLayout.css'

type PlanningLayoutProps = {
  children: ReactNode
}

function PlanningLayout({ children }: PlanningLayoutProps) {
  return <div className="planning-layout">{children}</div>
}

export default PlanningLayout
