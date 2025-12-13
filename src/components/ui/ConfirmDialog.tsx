import React from 'react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  tone = 'danger',
  onConfirm,
  onCancel,
}) => {
  const isDanger = tone === 'danger'

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      variant={isDanger ? 'danger' : 'default'}
      footer={
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all active:scale-95 ${
              isDanger
                ? 'bg-danger-600 hover:bg-danger-700'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {description && <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{description}</p>}
        {!description && (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">هل أنت متأكد من تنفيذ هذه العملية؟ لا يمكن التراجع بعد التأكيد.</p>
        )}
      </div>
    </Modal>
  )
}
