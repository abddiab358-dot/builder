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
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2 text-right">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">لوحة التحكم</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            نظرة سريعة شاملة على مشاريعك والمهام والعملاء
          </p>
        </div>
        <Link
          to="/projects/new"
          className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
        >
          + مشروع جديد
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Projects Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md hover:shadow-md dark:hover:shadow-dark-lg transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              نشط
            </span>
          </div>
          <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">إجمالي المشاريع</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalProjects}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            <span className="text-primary-600 dark:text-primary-400 font-semibold">{inProgress}</span> قيد التنفيذ
          </p>
        </div>

        {/* Total Tasks Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md hover:shadow-md dark:hover:shadow-dark-lg transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              المهام
            </span>
          </div>
          <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">إجمالي المهام</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalTasks}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            تتبع جميع المهام والعمليات
          </p>
        </div>

        {/* Total Clients Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md hover:shadow-md dark:hover:shadow-dark-lg transition-all duration-300 transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 10-22 0v2h2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              عملاء
            </span>
          </div>
          <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">إجمالي العملاء</h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalClients}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            العملاء المسجلين بنجاح
          </p>
        </div>
      </div>

      {/* Recent Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md hover:shadow-md dark:hover:shadow-dark-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">أحدث المشاريع</h2>
            <Link
              to="/projects"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
            >
              عرض الكل →
            </Link>
          </div>
          <div className="space-y-3">
            {(projects ?? []).length > 0 ? (
              (projects ?? [])
                .slice(-5)
                .reverse()
                .map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="block p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-right">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {p.startDate && new Date(p.startDate).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                          {p.status === 'in_progress' ? 'جاري' : p.status === 'completed' ? 'مكتمل' : 'معلق'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">لا توجد مشاريع بعد</p>
                <Link to="/projects/new" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
                  أنشئ المشروع الأول
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md hover:shadow-md dark:hover:shadow-dark-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">مهام قيد التنفيذ</h2>
            <Link
              to="/projects"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
            >
              إدارة المهام →
            </Link>
          </div>
          <div className="space-y-3">
            {(tasks ?? []).length > 0 ? (
              (tasks ?? [])
                .filter((t) => t.status === 'in_progress')
                .slice(0, 5)
                .map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border-r-4 border-primary-600 dark:border-primary-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 text-right">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-50">
                          {t.title}
                        </h4>
                        {t.dueDate && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            📅 {new Date(t.dueDate).toLocaleDateString('ar-EG')}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 mt-2"></div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">لا توجد مهام قيد التنفيذ</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">رائع! جميع المهام مكتملة أو معلقة</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
