export type Marketplace = 'Uzum Market' | 'Wildberries' | 'Ozon' | 'Avito' | 'Kaspi'

export type Tone = 'Продающий' | 'Премиальный' | 'Экспертный' | 'Дружелюбный'

export type Language = 'Русский' | 'Узбекский' | 'Английский'

export type RefineMode = 'shorter' | 'longer'

export type PresetId = 'clothing' | 'electronics' | 'cosmetics'

export interface ProductFormData {
  title: string
  marketplace: Marketplace
  features: string
  tone: Tone
  language: Language
  abMode: boolean
}

export interface MarketplaceLimits {
  title: number
  description: number
  note: string
}

export interface MarketplaceImageSpec {
  width: number
  height: number
  aspectRatio: string
  label: string
}

/** Рекомендуемые размеры главного фото / инфографики */
export const MARKETPLACE_IMAGE_SPECS: Record<Marketplace, MarketplaceImageSpec> = {
  'Uzum Market': {
    width: 1000,
    height: 1000,
    aspectRatio: '1:1',
    label: '1000×1000',
  },
  Wildberries: {
    width: 900,
    height: 1200,
    aspectRatio: '3:4',
    label: '900×1200',
  },
  Ozon: {
    width: 1200,
    height: 1500,
    aspectRatio: '4:5',
    label: '1200×1500',
  },
  Avito: {
    width: 1280,
    height: 960,
    aspectRatio: '4:3',
    label: '1280×960',
  },
  Kaspi: {
    width: 1200,
    height: 1200,
    aspectRatio: '1:1',
    label: '1200×1200',
  },
}

export interface HistoryItem {
  id: string
  createdAt: number
  productTitle: string
  marketplace: Marketplace
  tone: Tone
  language: Language
  variantA: string
  variantB?: string
  abMode: boolean
}

export interface CategoryPreset {
  id: PresetId
  label: string
  data: Omit<ProductFormData, 'abMode'>
}

export const MARKETPLACES: Marketplace[] = [
  'Uzum Market',
  'Wildberries',
  'Ozon',
  'Avito',
  'Kaspi',
]

/** Лимиты символов для карточки (ориентиры площадок) */
export const MARKETPLACE_LIMITS: Record<Marketplace, MarketplaceLimits> = {
  'Uzum Market': {
    title: 120,
    description: 5000,
    note: 'Uzum: название до 120, описание до 5000 символов',
  },
  Wildberries: {
    title: 100,
    description: 5000,
    note: 'WB: название до 100, описание до 5000 символов',
  },
  Ozon: {
    title: 200,
    description: 6000,
    note: 'Ozon: название до 200, описание до 6000 символов',
  },
  Avito: {
    title: 50,
    description: 7500,
    note: 'Avito: название до 50, описание до 7500 символов',
  },
  Kaspi: {
    title: 120,
    description: 5000,
    note: 'Kaspi: название до 120, описание до 5000 символов',
  },
}

export const TONES: Tone[] = ['Продающий', 'Премиальный', 'Экспертный', 'Дружелюбный']

export const LANGUAGES: Language[] = ['Русский', 'Узбекский', 'Английский']

export const CATEGORY_PRESETS: CategoryPreset[] = [
  {
    id: 'clothing',
    label: 'Одежда',
    data: {
      title: 'Футболка oversize из хлопка',
      marketplace: 'Wildberries',
      features:
        '100% хлопок, свободный крой oversize, плотный трикотаж 180 г/м², унисекс, не садится после стирки, базовые цвета',
      tone: 'Дружелюбный',
      language: 'Русский',
    },
  },
  {
    id: 'electronics',
    label: 'Электроника',
    data: {
      title: 'Беспроводные наушники ANC Pro',
      marketplace: 'Ozon',
      features:
        'Активное шумоподавление ANC, Bluetooth 5.3, до 40 ч работы, быстрая зарядка Type-C, сенсорное управление, чехол в комплекте',
      tone: 'Экспертный',
      language: 'Русский',
    },
  },
  {
    id: 'cosmetics',
    label: 'Косметика',
    data: {
      title: 'Сыворотка с ниацинамидом 10%',
      marketplace: 'Uzum Market',
      features:
        'Ниацинамид 10%, выравнивает тон, сужает поры, лёгкая текстура, без парабенов, подходит для комбинированной кожи, 30 мл',
      tone: 'Премиальный',
      language: 'Русский',
    },
  },
]

export const DEFAULT_FORM: ProductFormData = {
  title: '',
  marketplace: 'Uzum Market',
  features: '',
  tone: 'Продающий',
  language: 'Русский',
  abMode: false,
}
