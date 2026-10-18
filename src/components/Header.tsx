import { History, KeyRound } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import type { Theme } from '../hooks/useTheme'

interface HeaderProps {
  isConfigured: boolean
  theme: Theme
  historyCount: number
  onToggleTheme: () => void
  onOpenKeyModal: () => void
  onOpenHistory: () => void
}

export function Header({
  isConfigured,
  theme,
  historyCount,
  onToggleTheme,
  onOpenKeyModal,
  onOpenHistory,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--glass-border)] bg-[var(--glass)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight sm:text-xl">
            Desc<span className="text-[var(--accent)]">AI</span>
          </p>
          <p className="truncate text-xs text-[var(--text-muted)] sm:text-sm">
            ИИ-генератор описаний для маркетплейсов
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative flex items-center gap-2 rounded-xl border border-[var(--glass-border)] px-2.5 py-1.5 text-xs transition hover:border-[var(--accent)]/40 sm:px-3 sm:text-sm"
          >
            <History className="size-3.5 text-[var(--text-muted)]" />
            <span className="hidden text-[var(--text-muted)] sm:inline">История</span>
            {historyCount > 0 && (
              <span className="rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                {historyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenKeyModal}
            className="flex items-center gap-2 rounded-xl border border-[var(--glass-border)] px-2.5 py-1.5 text-xs transition hover:border-[var(--accent)]/40 sm:px-3 sm:text-sm"
          >
            <span
              className={`size-2 rounded-full ${
                isConfigured ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'
              }`}
            />
            <KeyRound className="hidden size-3.5 text-[var(--text-muted)] sm:block" />
            <span className="text-[var(--text-muted)]">
              {isConfigured ? 'Подключен' : 'Не настроен'}
            </span>
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
