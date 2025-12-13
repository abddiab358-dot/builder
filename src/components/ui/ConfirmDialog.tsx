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
        <div className="flex justify-between w-full">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-xs border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            className={`px-3 py-1.5 rounded-md text-xs font-medium text-white ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="space-y-2 text-xs text-slate-700 dark:text-slate-100">
        {description && <p>{description}</p>}
        {!description && (
          <p>هل أنت متأكد من تنفيذ هذه العملية؟ لا يمكن التراجع بعد الحذف.</p>
        )}
      </div>
    </Modal>
  )
}
