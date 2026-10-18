import { GoogleGenAI } from '@google/genai'
import { MARKETPLACE_LIMITS, type ProductFormData, type RefineMode } from '../types'

const MODEL = 'gemini-3.8-flash'

function buildSystemPrompt(data: ProductFormData, styleHint?: string): string {
  const limits = MARKETPLACE_LIMITS[data.marketplace]

  return `Ты — эксперт по e-commerce копирайтингу и SEO для маркетплейсов.
Создай готовое к публикации описание товара для площадки «${data.marketplace}».

Требования к структуре ответа (строго Markdown):
1. Завлекающий SEO-заголовок (H1) — до ${limits.title} символов
2. Краткий продающий лид (1–2 предложения)
3. Маркированный список ключевых преимуществ (5–8 буллетов)
4. Подробное описание товара (2–4 абзаца)
5. Блок «Характеристики» (список)
6. Призыв к покупке (CTA)
7. Финальная секция «## SEO-теги» со строкой хэштегов через пробел

Правила:
- Язык ответа: ${data.language}
- Тон повествования: ${data.tone}
- Учитывай особенности маркетплейса ${data.marketplace}
- Общая длина описания (без заголовка) ориентировочно до ${limits.description} символов — не раздувай сверх лимита
- SEO-оптимизация, без воды и клише
- Не выдумывай характеристики, которых нет во входных данных
- Не добавляй пояснений вне готового описания
${styleHint ? `- Стиль варианта: ${styleHint}` : ''}`
}

function buildUserPrompt(data: ProductFormData): string {
  return `Название товара: ${data.title}

Ключевые характеристики и плюсы:
${data.features.trim() || 'Не указаны — опирайся на название и типичные ожидания покупателей, без ложных фактов.'}`
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const e = error as { status?: unknown; code?: unknown }
  if (typeof e.status === 'number') return e.status
  if (typeof e.code === 'number') return e.code
  return undefined
}

function extractApiMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as {
      error?: { message?: string }
    }
    if (parsed.error?.message) return parsed.error.message
  } catch {
    const match = raw.match(/"message"\s*:\s*"((?:\\.|[^"\\])*)"/)
    if (match?.[1]) {
      return match[1].replace(/\\"/g, '"').replace(/\\n/g, ' ')
    }
  }
  return raw
}

function isRateLimitError(status: number | undefined, lower: string): boolean {
  if (status === 429) return true
  return (
    lower.includes('resource_exhausted') ||
    lower.includes('rate limit') ||
    lower.includes('rate_limit') ||
    lower.includes('quota exceeded') ||
    lower.includes('exceeded your current quota') ||
    lower.includes('too many requests')
  )
}

function isAuthError(status: number | undefined, lower: string): boolean {
  if (status === 401 || status === 403) return true
  return (
    lower.includes('api key not valid') ||
    lower.includes('api_key_invalid') ||
    lower.includes('invalid api key') ||
    lower.includes('permission denied') ||
    lower.includes('unauthenticated') ||
    lower.includes('unauthorized')
  )
}

function mapError(error: unknown): Error {
  if (!navigator.onLine) {
    return new Error('Нет подключения к сети. Проверьте интернет и попробуйте снова.')
  }

  const rawMessage = error instanceof Error ? error.message : String(error)
  const message = extractApiMessage(rawMessage)
  const lower = message.toLowerCase()
  const status = getErrorStatus(error)

  if (isAuthError(status, lower)) {
    return new Error(
      'Неверный или отозванный API-ключ. Откройте настройки ключа и введите корректный ключ из Google AI Studio.',
    )
  }

  if (isRateLimitError(status, lower)) {
    return new Error(
      'Превышен лимит запросов Gemini. Подождите 30–60 секунд или проверьте квоту в Google AI Studio.',
    )
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed')
  ) {
    return new Error('Ошибка сети при обращении к Gemini API. Проверьте соединение.')
  }

  if (status === 404 || lower.includes('not found') || lower.includes('no longer available')) {
    return new Error(message || 'Модель недоступна.')
  }

  return new Error(message || 'Не удалось выполнить запрос к Gemini. Попробуйте ещё раз.')
}

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  contents: string,
): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: 0.85,
      },
    })

    const text = response.text?.trim()
    if (!text) {
      throw new Error('Пустой ответ от модели. Попробуйте изменить данные товара.')
    }
    return text
  } catch (error) {
    throw mapError(error)
  }
}

export async function generateDescription(
  data: ProductFormData,
  apiKey: string,
): Promise<string> {
  if (!apiKey.trim()) throw new Error('API-ключ не настроен.')
  return callGemini(apiKey, buildSystemPrompt(data), buildUserPrompt(data))
}

export interface ABResult {
  variantA: string
  variantB: string
}

export async function generateABDescriptions(
  data: ProductFormData,
  apiKey: string,
): Promise<ABResult> {
  if (!apiKey.trim()) throw new Error('API-ключ не настроен.')

  const limits = MARKETPLACE_LIMITS[data.marketplace]
  const systemInstruction = `Ты — эксперт по e-commerce копирайтингу для маркетплейсов.
Сгенерируй ДВА разных Markdown-описания одного товара для A/B теста.

Вариант A: эмоциональный продающий стиль, акцент на выгоды и срочность.
Вариант B: экспертный/премиальный стиль, акцент на факты, качество и доверие.

Общие правила:
- Язык: ${data.language}
- Базовый тон формы: ${data.tone} (адаптируй под A и B)
- Маркетплейс: ${data.marketplace}
- Заголовок (H1) до ${limits.title} символов
- Описание ориентировочно до ${limits.description} символов
- Структура каждого варианта: H1, лид, буллеты, описание, характеристики, CTA, секция ## SEO-теги
- Не выдумывай характеристики

Формат ответа СТРОГО:
<<<VARIANT_A>>>
...markdown...
<<<VARIANT_B>>>
...markdown...`

  const raw = await callGemini(apiKey, systemInstruction, buildUserPrompt(data))
  const parsed = parseABResponse(raw)

  if (!parsed.variantA || !parsed.variantB) {
    // Fallback: два параллельных запроса с разными стилями
    const [variantA, variantB] = await Promise.all([
      callGemini(
        apiKey,
        buildSystemPrompt(data, 'эмоциональный продающий, выгоды и CTA'),
        buildUserPrompt(data),
      ),
      callGemini(
        apiKey,
        buildSystemPrompt(data, 'экспертный премиальный, факты и доверие'),
        buildUserPrompt(data),
      ),
    ])
    return { variantA, variantB }
  }

  return parsed
}

function parseABResponse(raw: string): ABResult {
  const aMatch = raw.match(/<<<VARIANT_A>>>\s*([\s\S]*?)(?=<<<VARIANT_B>>>|$)/i)
  const bMatch = raw.match(/<<<VARIANT_B>>>\s*([\s\S]*?)$/i)
  return {
    variantA: aMatch?.[1]?.trim() ?? '',
    variantB: bMatch?.[1]?.trim() ?? '',
  }
}

export async function refineDescription(
  text: string,
  mode: RefineMode,
  apiKey: string,
  language: string,
): Promise<string> {
  if (!apiKey.trim()) throw new Error('API-ключ не настроен.')

  const instruction =
    mode === 'shorter'
      ? 'Сократи описание примерно на 30–40%, сохрани структуру Markdown, ключевые факты, CTA и секцию SEO-тегов.'
      : 'Расширь описание примерно на 30–40%: добавь детали, выгоды и убедительные формулировки, сохрани структуру Markdown и секцию SEO-тегов.'

  const systemInstruction = `Ты редактор карточек товаров на маркетплейсах.
${instruction}
Язык результата: ${language}.
Верни только готовый Markdown без пояснений.`

  return callGemini(apiKey, systemInstruction, text)
}

export function extractHashtags(markdown: string): string[] {
  const tags = markdown.match(/#[\p{L}\p{N}_]+/gu) ?? []
  return [...new Set(tags)]
}

/** Примерная длина «чистого» текста без markdown-разметки */
export function plainTextLength(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_`>\[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length
}
