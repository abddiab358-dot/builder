import { Worker } from '../../types/domain'

interface Props {
  workers: Worker[]
  onDelete?: (id: string) => void
}

export function WorkerList({ workers, onDelete }: Props) {
  if (!workers.length) {
    return <div className="text-sm text-slate-500 text-right">لا يوجد عمال مرتبطون بهذا المشروع.</div>
  }

  return (
    <div className="space-y-2">
      {workers.map((w) => (
        <div
          key={w.id}
          className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col gap-1 text-right"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium text-slate-900">{w.name}</div>
              <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                {w.role && <span>الدور: {w.role}</span>}
                {w.phone && <span>هاتف: {w.phone}</span>}
                {w.dailyRate != null && <span>أجر يومي: {w.dailyRate} ريال</span>}
              </div>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(w.id)}
                className="px-2 py-1 rounded-md text-[11px] bg-red-50 text-red-600 hover:bg-red-100"
              >
                حذف
              </button>
            )}
          </div>
          {w.notes && <div className="text-xs text-slate-600 mt-1">{w.notes}</div>}
        </div>
      ))}
    </div>
  )
}
