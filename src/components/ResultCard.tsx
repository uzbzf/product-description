import { useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  Check,
  Copy,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react'
import { extractHashtags } from '../services/gemini'
import type { Marketplace, RefineMode } from '../types'
import { CharLimitBar } from './CharLimitBar'

interface ResultCardProps {
  result: string
  variantB: string
  abMode: boolean
  activeVariant: 'A' | 'B'
  productTitle: string
  marketplace: Marketplace
  loading: boolean
  refining: RefineMode | 'regenerate' | null
  onSelectVariant: (v: 'A' | 'B') => void
  onCopy: () => void
  onRegenerate: () => void
  onRefine: (mode: RefineMode) => void
  onCopyTag: (tag: string) => void
}

export function ResultCard({
  result,
  variantB,
  abMode,
  activeVariant,
  productTitle,
  marketplace,
  loading,
  refining,
  onSelectVariant,
  onCopy,
  onRegenerate,
  onRefine,
  onCopyTag,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false)
  const tags = useMemo(() => extractHashtags(result), [result])

  const handleCopy = async () => {
    onCopy()
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (!result && !loading) {
    return (
      <div className="glass flex min-h-[320px] flex-col items-center justify-center rounded-2xl p-8 text-center">
        <p className="text-base font-medium">Результат появится здесь</p>
        <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
          Заполните форму или выберите шаблон категории
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="glass rounded-2xl p-5 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Описание</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Markdown · SEO-готово{abMode ? ' · A/B' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!result || loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] px-3 py-2 text-sm transition hover:border-[var(--accent)]/40 disabled:opacity-40"
        >
          {copied ? (
            <>
              <Check className="size-4 text-[var(--success)]" />
              Скопировано
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Скопировать
            </>
          )}
        </button>
      </div>

      {abMode && (result || variantB) && (
        <div className="mb-4 flex gap-2">
          <VariantTab
            active={activeVariant === 'A'}
            label="Вариант A"
            hint="Продающий"
            onClick={() => onSelectVariant('A')}
          />
          <VariantTab
            active={activeVariant === 'B'}
            label="Вариант B"
            hint="Экспертный"
            disabled={!variantB}
            onClick={() => onSelectVariant('B')}
          />
        </div>
      )}

      {(result || productTitle) && (
        <div className="mb-4">
          <CharLimitBar
            marketplace={marketplace}
            title={productTitle}
            description={result}
          />
        </div>
      )}

      {loading && !result ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
          <Loader2 className="size-6 animate-spin text-[var(--accent)]" />
          <p className="text-sm">
            {abMode ? 'Gemini готовит 2 варианта...' : 'Gemini пишет описание...'}
          </p>
        </div>
      ) : (
        <>
          <div className={`prose-result relative ${refining ? 'opacity-60' : ''}`}>
            {refining && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-[var(--accent)]" />
              </div>
            )}
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>

          {tags.length > 0 && (
            <div className="mt-6 border-t border-[var(--glass-border)] pt-5">
              <p className="mb-3 text-sm font-medium">SEO-теги</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <motion.button
                    key={tag}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onCopyTag(tag)}
                    className="rounded-lg border border-[var(--glass-border)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-[var(--accent)] transition hover:border-[var(--accent)]/50"
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--glass-border)] pt-5">
            <ActionButton
              disabled={!!refining || loading}
              busy={refining === 'regenerate'}
              onClick={onRegenerate}
              icon={<RefreshCw className={`size-3.5 ${refining === 'regenerate' ? 'animate-spin' : ''}`} />}
              label="Перегенерировать"
            />
            <ActionButton
              disabled={!!refining || loading}
              busy={refining === 'shorter'}
              onClick={() => onRefine('shorter')}
              icon={<Minimize2 className="size-3.5" />}
              label="Сделать короче"
            />
            <ActionButton
              disabled={!!refining || loading}
              busy={refining === 'longer'}
              onClick={() => onRefine('longer')}
              icon={<Maximize2 className="size-3.5" />}
              label="Сделать подробнее"
            />
          </div>
        </>
      )}
    </motion.div>
  )
}

function VariantTab({
  active,
  label,
  hint,
  disabled,
  onClick,
}: {
  active: boolean
  label: string
  hint: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex-1 rounded-xl border px-3 py-2 text-left transition disabled:opacity-40 ${
        active
          ? 'border-[var(--accent)]/50 bg-[var(--accent-soft)]'
          : 'border-[var(--glass-border)] hover:border-[var(--accent)]/30'
      }`}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="text-[11px] text-[var(--text-muted)]">{hint}</p>
    </button>
  )
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  busy,
}: {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled: boolean
  busy: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--glass-border)] px-3 py-2 text-xs transition hover:border-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : icon}
      {label}
    </button>
  )
}
