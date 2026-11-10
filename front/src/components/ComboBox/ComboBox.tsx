import type { SelectHTMLAttributes } from 'react'
import './ComboBox.css'

type ComboBoxProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
}

function ComboBox({ label, id, children, ...props }: ComboBoxProps) {
  return (
    <div className="combo-box">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...props}>
        {children}
      </select>
    </div>
  )
}

export default ComboBox