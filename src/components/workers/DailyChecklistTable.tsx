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
  onSave?: (items: DailyChecklistItem[]) => Promise<void>
  initialItems?: DailyChecklistItem[]
}

export function DailyChecklistTable({ workers, onSave, initialItems = [] }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<DailyChecklistItem[]>(initialItems)
  const [saving, setSaving] = useState(false)

  // تحديث القائمة عند تغيير التاريخ
  useEffect(() => {
    const dateItems = initialItems.filter((item) => item.date === selectedDate)
    if (dateItems.length === 0) {
      // إنشاء عناصر جديدة للعمال الحاليين
      setItems(
        workers.map((w) => ({
          id: createId(),
          date: selectedDate,
          workerId: w.id,
          workerName: w.name,
          present: false,
          notes: '',
        }))
      )
    } else {
      setItems(dateItems)
    }
  }, [selectedDate])

  const handleTogglePresent = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, present: !item.present } : item)))
  }

  const handleNoteChange = (id: string, notes: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, notes } : item)))
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(items)
    } finally {
      setSaving(false)
    }
  }

  const presentCount = items.filter((item) => item.present).length
  const absentCount = items.filter((item) => !item.present).length
  const totalCount = items.length

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    لا يوجد عمال للعرض
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-50 font-medium">{item.workerName}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePresent(item.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          item.present
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

      {onSave && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:bg-slate-300 transition-all"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التفقد'}
          </button>
        </div>
      )}
    </div>
  )
}
