import React from 'react'

interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'danger'
}

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, footer, variant = 'default' }) => {
  if (!open) return null

  const isDanger = variant === 'danger'

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <h2
            className={`text-sm font-semibold text-right flex-1 ml-4 truncate ${
              isDanger ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-slate-50'
            }`}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
          >
            <span className="sr-only">إغلاق</span>
            ×
          </button>
        </div>
        <div className="px-4 py-3 text-right text-sm text-slate-800 dark:text-slate-100 max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-900">
          {children}
        </div>
        {footer && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 flex justify-between gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
