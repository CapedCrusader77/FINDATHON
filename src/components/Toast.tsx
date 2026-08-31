import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

type ToastTone = 'success' | 'info' | 'error'
type Toast = { id: number; message: string; tone: ToastTone }
type ToastContextValue = { pushToast: (message: string, tone?: ToastTone) => void }

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const pushToast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(current => [...current, { id, message, tone }])
    window.setTimeout(() => setToasts(current => current.filter(item => item.id !== id)), 4200)
  }, [])
  const value = useMemo(() => ({ pushToast }), [pushToast])
  return <ToastContext.Provider value={value}>{children}<ToastViewport toasts={toasts} dismiss={id => setToasts(current => current.filter(item => item.id !== id))} /></ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}

function ToastViewport({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2.5" aria-live="polite"><AnimatePresence initial={false}>{toasts.map(toast => { const Icon = toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? XCircle : Info; return <motion.div key={toast.id} initial={{ opacity: 0, y: 12, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .96 }} className="pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/95 p-3.5 text-sm text-slate-100 shadow-2xl backdrop-blur-xl"><Icon size={18} className={toast.tone === 'success' ? 'mt-0.5 shrink-0 text-emerald-400' : toast.tone === 'error' ? 'mt-0.5 shrink-0 text-rose-400' : 'mt-0.5 shrink-0 text-indigo-400'} /><p className="flex-1 leading-5">{toast.message}</p><button onClick={() => dismiss(toast.id)} className="rounded-md p-0.5 text-slate-500 hover:bg-white/10 hover:text-white" aria-label="Dismiss notification"><X size={15} /></button></motion.div> })}</AnimatePresence></div>
}
