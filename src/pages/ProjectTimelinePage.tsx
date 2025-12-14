import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import { BackButton } from '../components/ui/BackButton'

export function ProjectTimelinePage() {
  const { id } = useParams<{ id: string }>()
  const { data: projects } = useProjects()
  const { data: tasksData } = useTasks(id)

  if (!id) return null

  const project = (projects ?? []).find((p) => p.id === id)
  const tasks = tasksData ?? []

  const tasksWithDates = tasks.filter((t) => t.dueDate)

  const { minDate, maxDate } = useMemo(() => {
    if (!tasksWithDates.length) return { minDate: null as Date | null, maxDate: null as Date | null }
    const dates = tasksWithDates.map((t) => new Date(t.dueDate as string))
    let min = dates[0]
    let max = dates[0]
    for (const d of dates) {
      if (d.getTime() < min.getTime()) min = d
      if (d.getTime() > max.getTime()) max = d
    }
    return { minDate: min, maxDate: max }
  }, [tasksWithDates])

  const rangeMs = minDate && maxDate ? maxDate.getTime() - minDate.getTime() || 1 : 1

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">الجدول الزمني لمهام المشروع</h2>
          {project && <p className="text-xs text-slate-600">{project.title}</p>}
          {!tasksWithDates.length && (
            <p className="text-[11px] text-slate-500 mt-1">
              لا توجد مهام تحتوي على تاريخ استحقاق. يمكنك إضافة تواريخ من صفحة "مهام المشروع" لعرض مخطط زمني بصري.
            </p>
          )}
        </div>
        <BackButton fallbackPath={`/projects/${id}`} />
      </div>

      {tasksWithDates.length > 0 && minDate && maxDate && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
            <div>
              من: {minDate.toLocaleDateString('ar-EG')} — إلى: {maxDate.toLocaleDateString('ar-EG')}
            </div>
            <div>عدد المهام ذات تاريخ استحقاق: {tasksWithDates.length}</div>
          </div>

          <div className="space-y-3">
            {tasksWithDates.map((t) => {
              const d = new Date(t.dueDate as string)
              const offset = ((d.getTime() - minDate.getTime()) / rangeMs) * 100
              const width = Math.max(4, 100 - offset)

              return (
                <div key={t.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-slate-900 dark:text-slate-50 truncate">{t.title}</div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {d.toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  <div className="relative w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="absolute inset-y-0 bg-primary-500/80"
                      style={{ right: `${offset}%`, width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 text-xs space-y-2">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1">ملاحظات حول استخدام المخطط الزمني</div>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
          <li>يتم الاعتماد على تاريخ الاستحقاق لكل مهمة لرسم موضعها على الخط الزمني.</li>
          <li>المهام بدون تاريخ استحقاق لا تظهر في هذا المخطط ويمكن إدارتها من صفحة "مهام المشروع".</li>
          <li>هذا العرض مبسط ليساعدك على رؤية تكدّس المواعيد خلال فترة التنفيذ.</li>
        </ul>
      </div>
    </div>
  )
}
