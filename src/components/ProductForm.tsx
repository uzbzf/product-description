import { FlaskConical, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  CATEGORY_PRESETS,
  LANGUAGES,
  MARKETPLACE_IMAGE_SPECS,
  MARKETPLACE_LIMITS,
  MARKETPLACES,
  TONES,
  type PresetId,
  type ProductFormData,
} from '../types'

interface ProductFormProps {
  data: ProductFormData
  loading: boolean
  titleError: boolean
  onChange: (data: ProductFormData) => void
  onSubmit: () => void
  onApplyPreset: (id: PresetId) => void
}

const fieldClass =
  'w-full rounded-xl border border-[var(--glass-border)] bg-[var(--bg)]/50 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]'

export function ProductForm({
  data,
  loading,
  titleError,
  onChange,
  onSubmit,
  onApplyPreset,
}: ProductFormProps) {
  const limits = MARKETPLACE_LIMITS[data.marketplace]
  const imageSpec = MARKETPLACE_IMAGE_SPECS[data.marketplace]
  const titleLen = data.title.trim().length
  const titleOver = titleLen > limits.title

  const update = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    onChange({ ...data, [key]: value })
  }

  return (
    <form
      className="glass rounded-2xl p-5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">Данные товара</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          SEO-описания под лимиты маркетплейса
        </p>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm text-[var(--text-muted)]">Быстрые шаблоны</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className="rounded-xl border border-[var(--glass-border)] px-3 py-1.5 text-xs transition hover:border-[var(--accent)]/45 hover:bg-[var(--accent-soft)] sm:text-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="block text-sm text-[var(--text-muted)]" htmlFor="title">
              Название товара
            </label>
            <span
              className={`text-xs ${titleOver ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}
            >
              {titleLen}/{limits.title}
            </span>
          </div>
          <input
            id="title"
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Например: Беспроводные наушники ANC Pro"
            className={`${fieldClass} ${titleError || titleOver ? 'border-[var(--danger)]' : ''}`}
          />
          {titleError && (
            <p className="mt-1.5 text-xs text-[var(--danger)]">Укажите название товара</p>
          )}
          {titleOver && !titleError && (
            <p className="mt-1.5 text-xs text-[var(--danger)]">
              Название длиннее лимита {data.marketplace}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-[var(--text-muted)]" htmlFor="marketplace">
            Маркетплейс
          </label>
          <select
            id="marketplace"
            value={data.marketplace}
            onChange={(e) => update('marketplace', e.target.value as ProductFormData['marketplace'])}
            className={fieldClass}
          >
            {MARKETPLACES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            {limits.note}. Инфографика: {imageSpec.label} ({imageSpec.aspectRatio})
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-[var(--text-muted)]" htmlFor="features">
            Ключевые характеристики / Плюсы
          </label>
          <textarea
            id="features"
            rows={5}
            value={data.features}
            onChange={(e) => update('features', e.target.value)}
            placeholder="Шумоподавление, 40 ч батареи, Bluetooth 5.3..."
            className={`${fieldClass} min-h-[120px] resize-y`}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]" htmlFor="tone">
              Тон повествования
            </label>
            <select
              id="tone"
              value={data.tone}
              onChange={(e) => update('tone', e.target.value as ProductFormData['tone'])}
              className={fieldClass}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-[var(--text-muted)]" htmlFor="language">
              Язык текста
            </label>
            <select
              id="language"
              value={data.language}
              onChange={(e) => update('language', e.target.value as ProductFormData['language'])}
              className={fieldClass}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg)]/35 px-3 py-3">
          <div className="flex items-start gap-2.5">
            <FlaskConical className="mt-0.5 size-4 text-[var(--accent)]" />
            <div>
              <p className="text-sm font-medium">A/B тест — 2 варианта</p>
              <p className="text-xs text-[var(--text-muted)]">
                Сразу продающий и экспертный стили на выбор
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={data.abMode}
            onChange={(e) => update('abMode', e.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
        </label>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[#042f2e] transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {data.abMode ? 'Генерация A/B...' : 'Генерация...'}
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            {data.abMode ? 'Сгенерировать 2 варианта' : 'Сгенерировать описание'}
          </>
        )}
      </motion.button>
    </form>
  )
}
