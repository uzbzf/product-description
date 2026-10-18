import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

export interface ToastState {
  message: string
  type: 'success' | 'error'
}

interface ToastProps {
  toast: ToastState | null
}

export function Toast({ toast }: ToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="glass pointer-events-auto flex max-w-md items-center gap-2.5 rounded-2xl px-4 py-3 text-sm"
            role="status"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="size-4 shrink-0 text-[var(--success)]" />
            ) : (
              <XCircle className="size-4 shrink-0 text-[var(--danger)]" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
