import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import { ApiKeyModal } from './components/ApiKeyModal'
import { ProductForm } from './components/ProductForm'
import { ResultCard } from './components/ResultCard'
import { InfographicPromptCard } from './components/InfographicPromptCard'
import { HistorySidebar } from './components/HistorySidebar'
import { Toast, type ToastState } from './components/Toast'
import { useApiKey } from './hooks/useApiKey'
import { useTheme } from './hooks/useTheme'
import { useHistory } from './hooks/useHistory'
import {
  generateABDescriptions,
  generateDescription,
  refineDescription,
} from './services/gemini'
import {
  CATEGORY_PRESETS,
  DEFAULT_FORM,
  type HistoryItem,
  type PresetId,
  type ProductFormData,
  type RefineMode,
} from './types'

function App() {
  const { apiKey, setApiKey, isConfigured } = useApiKey()
  const { theme, toggleTheme } = useTheme()
  const { items, addItem, removeItem, clearHistory } = useHistory()

  const [form, setForm] = useState<ProductFormData>(DEFAULT_FORM)
  const [variantA, setVariantA] = useState('')
  const [variantB, setVariantB] = useState('')
  const [activeVariant, setActiveVariant] = useState<'A' | 'B'>('A')
  const [showAbTabs, setShowAbTabs] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refining, setRefining] = useState<RefineMode | 'regenerate' | null>(null)
  const [titleError, setTitleError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [keyModalOpen, setKeyModalOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const toastTimer = useRef<number | null>(null)

  const result = activeVariant === 'B' && variantB ? variantB : variantA

  useEffect(() => {
    if (!isConfigured) setKeyModalOpen(true)
  }, [isConfigured])

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = window.setTimeout(() => setToast(null), 2400)
  }

  const ensureKey = () => {
    if (!isConfigured) {
      setKeyModalOpen(true)
      showToast('Сначала укажите Gemini API ключ', 'error')
      return false
    }
    return true
  }

  const persistHistory = (a: string, b?: string, abMode = false) => {
    addItem({
      productTitle: form.title.trim(),
      marketplace: form.marketplace,
      tone: form.tone,
      language: form.language,
      variantA: a,
      variantB: b,
      abMode,
    })
  }

  const runGenerate = async (asRegenerate = false) => {
    if (!form.title.trim()) {
      setTitleError(true)
      return
    }
    setTitleError(false)
    if (!ensureKey()) return

    if (asRegenerate) setRefining('regenerate')
    setLoading(true)
    setError(null)

    try {
      if (form.abMode) {
        const ab = await generateABDescriptions(form, apiKey)
        setVariantA(ab.variantA)
        setVariantB(ab.variantB)
        setActiveVariant('A')
        setShowAbTabs(true)
        persistHistory(ab.variantA, ab.variantB, true)
        showToast('Готовы 2 варианта A/B')
      } else {
        const text = await generateDescription(form, apiKey)
        setVariantA(text)
        setVariantB('')
        setActiveVariant('A')
        setShowAbTabs(false)
        persistHistory(text, undefined, false)
        showToast('Описание готово')
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка генерации'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
      setRefining(null)
    }
  }

  const handleRefine = async (mode: RefineMode) => {
    if (!result || !ensureKey()) return
    setRefining(mode)
    setError(null)
    try {
      const text = await refineDescription(result, mode, apiKey, form.language)
      if (activeVariant === 'B') setVariantB(text)
      else setVariantA(text)
      showToast(mode === 'shorter' ? 'Описание сокращено' : 'Описание расширено')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка правки'
      setError(message)
      showToast(message, 'error')
    } finally {
      setRefining(null)
    }
  }

  const handleCopy = async (text = result) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Описание скопировано')
    } catch {
      showToast('Не удалось скопировать', 'error')
    }
  }

  const handleCopyTag = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag)
      showToast(`Скопировано: ${tag}`)
    } catch {
      showToast('Не удалось скопировать тег', 'error')
    }
  }

  const applyPreset = (id: PresetId) => {
    const preset = CATEGORY_PRESETS.find((p) => p.id === id)
    if (!preset) return
    setForm({ ...preset.data, abMode: form.abMode })
    setTitleError(false)
    showToast(`Шаблон «${preset.label}» загружен`)
  }

  const loadFromHistory = (item: HistoryItem, variant: 'A' | 'B') => {
    setForm((prev) => ({
      ...prev,
      title: item.productTitle,
      marketplace: item.marketplace,
      tone: item.tone,
      language: item.language,
      abMode: item.abMode,
    }))
    setVariantA(item.variantA)
    setVariantB(item.variantB ?? '')
    setShowAbTabs(item.abMode && Boolean(item.variantB))
    setActiveVariant(variant === 'B' && item.variantB ? 'B' : 'A')
    setHistoryOpen(false)
    showToast('Запись из истории открыта')
  }

  return (
    <div className="min-h-screen">
      <Header
        isConfigured={isConfigured}
        theme={theme}
        historyCount={items.length}
        onToggleTheme={toggleTheme}
        onOpenKeyModal={() => setKeyModalOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:py-8">
        <ProductForm
          data={form}
          loading={loading}
          titleError={titleError}
          onChange={(next) => {
            setForm(next)
            if (next.title.trim()) setTitleError(false)
          }}
          onSubmit={() => void runGenerate()}
          onApplyPreset={applyPreset}
        />

        <div className="space-y-3">
          {error && (
            <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}
          <ResultCard
            result={result}
            variantB={variantB}
            abMode={showAbTabs}
            activeVariant={activeVariant}
            productTitle={form.title}
            marketplace={form.marketplace}
            loading={loading}
            refining={refining}
            onSelectVariant={setActiveVariant}
            onCopy={() => void handleCopy()}
            onRegenerate={() => void runGenerate(true)}
            onRefine={handleRefine}
            onCopyTag={handleCopyTag}
          />
          <InfographicPromptCard
            data={form}
            onCopy={(text) => void handleCopy(text)}
          />
        </div>
      </main>

      <HistorySidebar
        open={historyOpen}
        items={items}
        onClose={() => setHistoryOpen(false)}
        onSelect={loadFromHistory}
        onCopy={(text) => void handleCopy(text)}
        onRemove={removeItem}
        onClear={() => {
          clearHistory()
          showToast('История очищена')
        }}
      />

      <ApiKeyModal
        open={keyModalOpen}
        initialValue={apiKey}
        onClose={() => setKeyModalOpen(false)}
        onSave={(key) => {
          setApiKey(key)
          showToast('API-ключ сохранён')
        }}
      />

      <Toast toast={toast} />
    </div>
  )
}

export default App
