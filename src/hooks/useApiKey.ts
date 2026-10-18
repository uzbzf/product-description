import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'gemini_api_key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })

  useEffect(() => {
    try {
      if (apiKey) {
        localStorage.setItem(STORAGE_KEY, apiKey)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore quota / private mode errors
    }
  }, [apiKey])

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key.trim())
  }, [])

  const clearApiKey = useCallback(() => {
    setApiKeyState('')
  }, [])

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    isConfigured: apiKey.length > 0,
  }
}
