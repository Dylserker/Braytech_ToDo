import type { SelectHTMLAttributes } from "react"

export type ComboBoxProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
}