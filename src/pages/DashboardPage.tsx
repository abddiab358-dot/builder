import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useTasks } from '../hooks/useTasks'
import { useClients } from '../hooks/useClients'

export function DashboardPage() {
  const { data: projects } = useProjects()
  const { data: tasks } = useTasks()
  const { data: clients } = useClients()

  const totalProjects = projects?.length ?? 0
  const totalTasks = tasks?.length ?? 0
  const totalClients = clients?.length ?? 0
  const inProgress = projects?.filter((p) => p.status === 'in_progress').length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1 text-right">
          <h2 className="text-xl font-bold text-slate-900">لوحة التحكم</h2>
          <p className="text-sm text-slate-600">
            نظرة سريعة على المشاريع الجارية والمهام والعملاء.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
        >
          + إضافة مشروع جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-right">
          <div className="text-xs text-slate-500">إجمالي المشاريع</div>
          <div className="text-2xl font-bold text-slate-900">{totalProjects}</div>
          <div className="text-xs text-slate-500 mt-1">{inProgress} مشروع قيد التنفيذ</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-right">
          <div className="text-xs text-slate-500">إجمالي المهام</div>
          <div className="text-2xl font-bold text-slate-900">{totalTasks}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-right">
          <div className="text-xs text-slate-500">إجمالي العملاء</div>
          <div className="text-2xl font-bold text-slate-900">{totalClients}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-right space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">أحدث المشاريع</h3>
            <Link to="/projects" className="text-xs text-primary-700 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-1 text-xs text-slate-700">
            {(projects ?? []).slice(-5).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <Link to={`/projects/${p.id}`} className="hover:text-primary-700">
                  {p.title}
                </Link>
                <span className="text-slate-400">
                  {p.startDate && new Date(p.startDate).toLocaleDateString('ar-EG')}
                </span>
              </div>
            ))}
            {!projects?.length && <div className="text-xs text-slate-500">لا توجد مشاريع بعد.</div>}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 text-right space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">مهام قيد التنفيذ</h3>
            <Link to="/projects" className="text-xs text-primary-700 hover:underline">
              إدارة المهام
            </Link>
          </div>
          <div className="space-y-1 text-xs text-slate-700">
            {(tasks ?? [])
              .filter((t) => t.status === 'in_progress')
              .slice(0, 5)
              .map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <div>{t.title}</div>
                  {t.dueDate && (
                    <span className="text-slate-400">
                      {new Date(t.dueDate).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>
              ))}
            {!tasks?.length && <div className="text-xs text-slate-500">لا توجد مهام بعد.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
