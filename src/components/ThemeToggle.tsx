import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Theme } from '../hooks/useTheme'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
      className="relative flex size-9 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--accent-soft)] text-[var(--text)] transition hover:border-[var(--accent)]/40"
    >
      <motion.span
        key={theme}
        initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </motion.span>
    </button>
  )
}
