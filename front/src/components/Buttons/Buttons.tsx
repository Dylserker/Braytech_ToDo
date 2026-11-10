import type { ButtonHTMLAttributes } from 'react'
import './Buttons.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`button button--${variant}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}

export default Button