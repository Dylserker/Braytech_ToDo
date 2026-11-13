import './ComboBox.css'
import type { ComboBoxProps } from '../../types/ComboBoxProps'

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