import type { ReactNode } from 'react'
import './HomeLayout.css'

type HomeLayoutProps = {
  children: ReactNode
}

function HomeLayout({ children }: HomeLayoutProps) {
  return <div className="home-layout">{children}</div>
}

export default HomeLayout
