import { useCallback, useEffect, useState } from 'react'
import type { HistoryItem } from '../types'

const STORAGE_KEY = 'desca_generation_history'
const MAX_ITEMS = 40

function readHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>(() => readHistory())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore quota errors
    }
  }, [items])

  const addItem = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const next: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }
    setItems((prev) => [next, ...prev].slice(0, MAX_ITEMS))
    return next
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setItems([])
  }, [])

  return { items, addItem, removeItem, clearHistory }
}
