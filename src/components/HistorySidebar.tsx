import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, History, Trash2, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { HistoryItem } from '../types'

interface HistorySidebarProps {
  open: boolean
  items: HistoryItem[]
  onClose: () => void
  onSelect: (item: HistoryItem, variant: 'A' | 'B') => void
  onCopy: (text: string) => void
  onRemove: (id: string) => void
  onClear: () => void
}

export function HistorySidebar({
  open,
  items,
  onClose,
  onSelect,
  onCopy,
  onRemove,
  onClear,
}: HistorySidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Закрыть историю"
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="glass fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--glass-border)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-4 py-4">
              <div className="flex items-center gap-2">
                <History className="size-4 text-[var(--accent)]" />
                <div>
                  <h2 className="text-base font-semibold">История</h2>
                  <p className="text-xs text-[var(--text-muted)]">{items.length} записей</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="rounded-lg px-2 py-1.5 text-xs text-[var(--text-muted)] transition hover:text-[var(--danger)]"
                  >
                    Очистить
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
                  aria-label="Закрыть"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {items.length === 0 ? (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-6 text-center">
                  <History className="mb-3 size-8 text-[var(--text-muted)] opacity-50" />
                  <p className="text-sm font-medium">История пуста</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Сгенерированные описания появятся здесь
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => (
                    <HistoryRow
                      key={item.id}
                      item={item}
                      onSelect={onSelect}
                      onCopy={onCopy}
                      onRemove={onRemove}
                    />
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function HistoryRow({
  item,
  onSelect,
  onCopy,
  onRemove,
}: {
  item: HistoryItem
  onSelect: (item: HistoryItem, variant: 'A' | 'B') => void
  onCopy: (text: string) => void
  onRemove: (id: string) => void
}) {
  const [copied, setCopied] = useState<'A' | 'B' | null>(null)
  const date = new Date(item.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const copy = (variant: 'A' | 'B', text: string) => {
    onCopy(text)
    setCopied(variant)
    window.setTimeout(() => setCopied(null), 1400)
  }

  return (
    <li className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg)]/35 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect(item, 'A')}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-medium">{item.productTitle}</p>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            {item.marketplace} · {date}
            {item.abMode ? ' · A/B' : ''}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"
          aria-label="Удалить"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <MiniAction
          label={copied === 'A' ? 'Скопировано A' : item.abMode ? 'Копировать A' : 'Копировать'}
          icon={copied === 'A' ? <Check className="size-3" /> : <Copy className="size-3" />}
          onClick={() => copy('A', item.variantA)}
        />
        {item.abMode && item.variantB && (
          <>
            <MiniAction label="Открыть B" onClick={() => onSelect(item, 'B')} />
            <MiniAction
              label={copied === 'B' ? 'Скопировано B' : 'Копировать B'}
              icon={copied === 'B' ? <Check className="size-3" /> : <Copy className="size-3" />}
              onClick={() => copy('B', item.variantB!)}
            />
          </>
        )}
      </div>
    </li>
  )
}

function MiniAction({
  label,
  icon,
  onClick,
}: {
  label: string
  icon?: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--glass-border)] px-2 py-1 text-[11px] text-[var(--text-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
    >
      {icon}
      {label}
    </button>
  )
}
