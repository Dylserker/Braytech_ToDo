import './ProgressBar.css'

type ProgressBarProps = {
  value: number
  max: number
  label: string
}

function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className="progress-bar">
      <div className="progress-bar__labels">
        <span>{label}</span>
        <span>{value} / {max} XP</span>
      </div>
      <div className="progress-bar__track" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
