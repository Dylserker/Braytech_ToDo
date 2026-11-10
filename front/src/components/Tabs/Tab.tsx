import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Tab.css'

type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  children: ReactNode
}

function Tab({ active = false, className = '', children, ...props }: TabProps) {
  return (
    <button
      className={`tab${active ? ' tab--active' : ''}${className ? ` ${className}` : ''}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export default Tab