import { MARKETPLACE_IMAGE_SPECS, type ProductFormData } from '../types'

/** Готовый промпт для Gemini (Image / Nano Banana) под инфографику товара */
export function buildInfographicPrompt(data: ProductFormData): string {
  const title = data.title.trim() || '[укажите название товара]'
  const features =
    data.features.trim() ||
    'ключевые плюсы не указаны — выдели 3 очевидных преимущества по виду товара, без ложных фактов'
  const spec = MARKETPLACE_IMAGE_SPECS[data.marketplace]

  const bullets = features
    .split(/[\n;•·|]+|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5)

  const featureLines =
    bullets.length > 0
      ? bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')
      : features

  return `Создай премиальную marketplace-инфографику карточки товара для «${data.marketplace}».

Прикрепи фото товара и используй его как основу: сохрани узнаваемый вид продукта, улучши свет, фон и композицию.

═══ ТОВАР ═══
Название: ${title}
Тон: ${data.tone}
Язык всех текстов на изображении: ${data.language}

Ключевые плюсы для плашек (ровно 3 коротких, uppercase):
${featureLines}

═══ РАЗМЕР ═══
Формат кадра: ${spec.aspectRatio}
Целевой размер: ${spec.label} px (${spec.width}×${spec.height})
Готово к загрузке на ${data.marketplace}

═══ СТИЛЬ (обязательно) ═══
- Тёмный атмосферный studio/lifestyle фон с глубиной (мягкий bokeh, лёгкая зелень/листья в размытии по краям)
- Товар крупно, реалистично, с драматичным светом и мягкой тенью
- БЕЗ белой рамки, карточки или «простого шаблона» вокруг фото
- Композиция: товар слева/снизу по центру; справа 3 вертикальные плашки-пилюли с ярким фиолетово-розовым градиентом
- Сверху крупный жирный заголовок ЗАГЛАВНЫМИ: первая строка чуть меньше, вторая — очень крупная (разбей название логично)
- Текст на плашках короткий, белый, высокая читаемость
- Без водяных знаков, логотипов маркетплейсов, QR-кодов и мелкого нечитаемого текста
- Cinematic product ad look, премиум e-commerce

═══ ВЫВОД ═══
Верни только одно итоговое изображение инфографики в указанном формате.`
}

export function canBuildPrompt(data: ProductFormData): boolean {
  return data.title.trim().length > 0
}
