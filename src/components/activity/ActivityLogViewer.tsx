import { useActivity } from '../../hooks/useActivity'

interface Props {
  compact?: boolean
}

export function ActivityLogViewer({ compact }: Props) {
  const { data, isLoading } = useActivity()

  if (isLoading) {
    return <div className="text-[11px] text-slate-500 text-right">جاري تحميل سجل النشاط...</div>
  }

  const events = (data ?? []).slice().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
  const toShow = compact ? events.slice(0, 5) : events

  if (!toShow.length) {
    return <div className="text-[11px] text-slate-400 text-right">لا يوجد نشاط بعد</div>
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 justify-end text-[11px] text-slate-600">
        {toShow.map((e) => (
          <span key={e.id} className="px-2 py-1 rounded-full bg-white border border-slate-200">
            {new Date(e.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} - {e.action}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-200 text-xs font-semibold text-slate-700 text-right">
        سجل النشاط
      </div>
      <div className="max-h-64 overflow-y-auto text-right text-xs">
        {toShow.map((e) => (
          <div key={e.id} className="px-3 py-1.5 border-b last:border-b-0 border-slate-100 flex justify-between gap-3">
            <div className="text-slate-700">{e.action}</div>
            <div className="text-slate-400 flex items-center gap-2">
              <span>{new Date(e.timestamp).toLocaleString('ar-EG')}</span>
              <span className="inline-flex px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{e.entity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
