import { useState, useEffect } from 'react'
import { Worker } from '../../types/domain'
import { createId } from '../../utils/id'

export interface DailyChecklistItem {
  id: string
  date: string
  workerId: string
  workerName: string
  present: boolean
  notes: string
}

interface Props {
  workers: Worker[]
  items: DailyChecklistItem[]
  date: string
  onDateChange: (date: string) => void
  onSave: (items: DailyChecklistItem[]) => Promise<void>
  loading?: boolean
}

export function DailyChecklistTable({ workers, items, date, onDateChange, onSave, loading }: Props) {
  const [localItems, setLocalItems] = useState<DailyChecklistItem[]>(items)
  const [saving, setSaving] = useState(false)

  // Update local items when props change
  useEffect(() => {
    if (!workers || workers.length === 0) {
      setLocalItems([])
      return
    }

    const mergedItems = workers.map((w) => {
      // البحث عن سجل موجود لهذا العامل
      const existingItem = items.find((i) => i.workerId === w.id)

      if (existingItem) {
        // تحديث الاسم لضمان دقته في حال تغييره
        return { ...existingItem, workerName: w.name }
      }

      // إنشاء سجل جديد
      return {
        id: createId(),
        date: date,
        workerId: w.id,
        workerName: w.name,
        present: false,
        notes: '',
      }
    })

    setLocalItems(mergedItems)
  }, [items, workers, date])

  const handleTogglePresent = (id: string) => {
    setLocalItems((prev) => prev.map((item) => (item.id === id ? { ...item, present: !item.present } : item)))
  }

  const handleNoteChange = (id: string, notes: string) => {
    setLocalItems((prev) => prev.map((item) => (item.id === id ? { ...item, notes } : item)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(localItems)
    } finally {
      setSaving(false)
    }
  }

  const presentCount = localItems.filter((item) => item.present).length
  const absentCount = localItems.filter((item) => !item.present).length
  const totalCount = localItems.length

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 text-xs font-medium">
          <div className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            حاضرون: {presentCount}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            غائبون: {absentCount}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            الإجمالي: {totalCount}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50 text-right">اسم العامل</th>
                <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50 text-center">حالة الحضور</th>
                <th className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50 text-right">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {localItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    لا يوجد عمال للعرض
                  </td>
                </tr>
              ) : (
                localItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-50 font-medium">{item.workerName}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePresent(item.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${item.present
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}
                      >
                        {item.present ? '✓ حاضر' : '✗ غائب'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        placeholder="ملاحظات إضافية..."
                        className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:bg-slate-300 transition-all"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التفقد'}
        </button>
      </div>
    </div>
  )
}
