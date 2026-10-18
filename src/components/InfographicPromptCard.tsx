import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, ExternalLink, ImageIcon } from 'lucide-react'
import { MARKETPLACE_IMAGE_SPECS, type ProductFormData } from '../types'
import { buildInfographicPrompt, canBuildPrompt } from '../services/infographicPrompt'

interface InfographicPromptCardProps {
  data: ProductFormData
  onCopy: (text: string) => void
}

export function InfographicPromptCard({ data, onCopy }: InfographicPromptCardProps) {
  const [copied, setCopied] = useState(false)
  const ready = canBuildPrompt(data)
  const prompt = ready ? buildInfographicPrompt(data) : ''
  const spec = MARKETPLACE_IMAGE_SPECS[data.marketplace]

  const handleCopy = () => {
    if (!ready) return
    onCopy(prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="glass rounded-2xl p-5 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Промпт для инфографики</h2>
          <p className="text-sm text-[var(--text-muted)]">
            {data.marketplace} · {spec.label} · {spec.aspectRatio}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!ready}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[#042f2e] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? (
            <>
              <Check className="size-4" />
              Скопировано
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Скопировать промпт
            </>
          )}
        </button>
      </div>

      {!ready ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--glass-border)] px-4 text-center">
          <ImageIcon className="size-7 text-[var(--text-muted)]" />
          <p className="text-sm font-medium">Укажите название товара</p>
          <p className="max-w-xs text-xs text-[var(--text-muted)]">
            Промпт соберётся автоматически под маркетплейс, тон и характеристики
          </p>
        </div>
      ) : (
        <>
          <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--glass-border)] bg-[var(--bg)]/45 p-3 font-sans text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
            {prompt}
          </pre>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--glass-border)] pt-4 text-xs text-[var(--text-muted)]">
            <span>Как использовать:</span>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[var(--accent)] transition hover:opacity-80"
            >
              Google AI Studio
              <ExternalLink className="size-3" />
            </a>
            <span>— вставьте промпт + фото товара в Gemini Image</span>
          </div>
        </>
      )}
    </motion.div>
  )
}
