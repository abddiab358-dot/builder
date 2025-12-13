import { NavLink, Outlet } from 'react-router-dom'
import { ActivityLogViewer } from '../activity/ActivityLogViewer'
import { NotificationBell } from '../notifications/NotificationBell'

const navLinkBase =
  'block w-full text-right px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary-50 dark:hover:bg-slate-800'

export function MainLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-sm dark:shadow-dark-md">
        {/* Logo Section */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">نظام المقاولات</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              إدارة شاملة للمشاريع والمهام والعملاء
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 text-right overflow-y-auto">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300'
              }`
            }
          >
            <div className="flex items-center justify-end gap-3">
              <span>لوحة التحكم</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m4 3l4-11m5 3l2 3M3 20h18" />
              </svg>
            </div>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300'
              }`
            }
          >
            <div className="flex items-center justify-end gap-3">
              <span>المشاريع</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300'
              }`
            }
          >
            <div className="flex items-center justify-end gap-3">
              <span>العملاء</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${navLinkBase} ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300'
              }`
            }
          >
            <div className="flex items-center justify-end gap-3">
              <span>الإعدادات</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-t-lg">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed font-medium">
            ✓ يعمل 100% بدون إنترنت
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2">
            File System API
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 shadow-sm dark:shadow-dark-md">
          <div className="flex-1 text-sm text-slate-600 dark:text-slate-300 text-right font-medium">
            اختر مشروعًا أو أنشئ مشروعًا جديدًا لبدء العمل
          </div>
          <div className="flex items-center gap-4">
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <NotificationBell />
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-dark-md">
          <ActivityLogViewer compact />
        </footer>
      </main>
    </div>
  )
}
