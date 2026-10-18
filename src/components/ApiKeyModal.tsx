import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, KeyRound, X } from 'lucide-react'

interface ApiKeyModalProps {
  open: boolean
  initialValue: string
  onClose: () => void
  onSave: (key: string) => void
}

export function ApiKeyModal({ open, initialValue, onClose, onSave }: ApiKeyModalProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (open) setValue(initialValue)
  }, [open, initialValue])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const handleSave = () => {
    if (!value.trim()) return
    onSave(value.trim())
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-key-title"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="glass relative w-full max-w-md rounded-2xl p-5 sm:p-6"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
              aria-label="Закрыть"
            >
              <X className="size-4" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <KeyRound className="size-5" />
              </div>
              <div>
                <h2 id="api-key-title" className="text-lg font-semibold tracking-tight">
                  Gemini API ключ
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Ключ сохраняется только в localStorage
                </p>
              </div>
            </div>

            <label className="mb-1.5 block text-sm text-[var(--text-muted)]" htmlFor="api-key-input">
              API Key
            </label>
            <input
              id="api-key-input"
              type="password"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
              placeholder="AIza..."
              className="mb-3 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg)]/60 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
            />

            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="mb-5 inline-flex items-center gap-1.5 text-sm text-[var(--accent)] transition hover:opacity-80"
            >
              Получить ключ в Google AI Studio
              <ExternalLink className="size-3.5" />
            </a>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--glass-border)] px-4 py-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)]/30"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!value.trim()}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#042f2e] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
