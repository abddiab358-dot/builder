import { useState } from 'react'
import { Project, ProjectStatus } from '../../types/domain'

interface Props {
  initial?: Partial<Project>
  onSubmit: (values: Omit<Project, 'id' | 'createdAt'>) => Promise<void> | void
  submitLabel: string
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'planned', label: 'مخطط' },
  { value: 'in_progress', label: 'جارٍ التنفيذ' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'on_hold', label: 'موقوف' },
  { value: 'cancelled', label: 'ملغى' },
]

export function ProjectForm({ initial, onSubmit, submitLabel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [clientName, setClientName] = useState(initial?.clientName ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'planned')
  const [startDate, setStartDate] = useState(initial?.startDate ?? new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')
  const [budget, setBudget] = useState(initial?.budget?.toString() ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        clientName: clientName.trim(),
        address: address.trim(),
        status,
        startDate,
        endDate: endDate || undefined,
        budget: budget ? Number(budget) : undefined,
        notes: notes.trim() || undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">اسم المشروع</label>
          <input
            className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">اسم العميل</label>
          <input
            className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">الموقع / العنوان</label>
          <input
            className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">حالة المشروع</label>
          <select
            className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">تاريخ البدء</label>
          <input
            type="date"
            className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">تاريخ الانتهاء (اختياري)</label>
          <input
            type="date"
            className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">الميزانية التقديرية</label>
          <input
            type="number"
            min={0}
            className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">ملاحظات</label>
        <textarea
          rows={3}
          className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:bg-slate-300 dark:disabled:bg-slate-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
