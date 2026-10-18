import { AlertTriangle } from 'lucide-react'
import { MARKETPLACE_LIMITS, type Marketplace } from '../types'
import { plainTextLength } from '../services/gemini'

interface CharLimitBarProps {
  marketplace: Marketplace
  title: string
  description: string
}

export function CharLimitBar({ marketplace, title, description }: CharLimitBarProps) {
  const limits = MARKETPLACE_LIMITS[marketplace]
  const titleLen = title.trim().length
  const descLen = plainTextLength(description)

  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg)]/40 px-3 py-3">
      <p className="mb-2 text-xs text-[var(--text-muted)]">{limits.note}</p>
      <div className="space-y-2">
        <Meter label="Название" value={titleLen} max={limits.title} />
        <Meter label="Описание" value={descLen} max={limits.description} />
      </div>
    </div>
  )
}

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
  const ratio = Math.min(value / max, 1)
  const over = value > max
  const warn = !over && value / max >= 0.9
  const color = over
    ? 'bg-[var(--danger)]'
    : warn
      ? 'bg-amber-400'
      : 'bg-[var(--accent)]'

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span
          className={`inline-flex items-center gap-1 font-medium ${
            over ? 'text-[var(--danger)]' : warn ? 'text-amber-500' : 'text-[var(--text)]'
          }`}
        >
          {(over || warn) && <AlertTriangle className="size-3" />}
          {value} / {max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--glass-border)]">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(ratio * 100, value > 0 ? 2 : 0)}%` }}
        />
      </div>
      {over && (
        <p className="mt-1 text-[11px] text-[var(--danger)]">
          Превышен лимит {label.toLowerCase()} для маркетплейса
        </p>
      )}
    </div>
  )
}
