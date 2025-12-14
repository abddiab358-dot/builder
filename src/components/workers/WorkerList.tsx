import { Worker } from '../../types/domain'

interface Props {
  workers: Worker[]
  onDelete?: (id: string) => void
}

export function WorkerList({ workers, onDelete }: Props) {
  if (!workers.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 10-22 0v2h2z" />
          </svg>
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">لا يوجد عمال</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">أضف عمالاً للمشروع لتتمكن من تتبعهم</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {workers.map((w) => (
        <div
          key={w.id}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 text-right shadow-sm dark:shadow-dark-md hover:shadow-md dark:hover:shadow-dark-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-base">{w.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
                {w.role && (
                  <span className="px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium">
                    {w.role}
                  </span>
                )}
                {w.phone && <span>📱 {w.phone}</span>}
                {w.dailyRate != null && (
                  <span className="px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium">
                    {w.dailyRate} ليرة سورية/يوم
                  </span>
                )}
              </div>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(w.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors whitespace-nowrap"
              >
                حذف
              </button>
            )}
          </div>
          {w.notes && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">📝 {w.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
