import { NavLink, Outlet } from 'react-router-dom'
import { ActivityLogViewer } from '../activity/ActivityLogViewer'
import { NotificationBell } from '../notifications/NotificationBell'

const navLinkBase =
  'block w-full text-right px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors'

export function MainLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950">
      <aside className="w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">نظام المقاولات</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">إدارة المشاريع والمهام والعملاء</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-right">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-700'}`
            }
          >
            لوحة التحكم
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-700'}`
            }
          >
            المشاريع
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-700'}`
            }
          >
            العملاء
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-700'}`
            }
          >
            الإعدادات والنسخ الاحتياطي
          </NavLink>
        </nav>
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          يعمل 100% بدون إنترنت
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
          <div className="flex-1 text-sm text-slate-600 dark:text-slate-200 text-right">
            مرحبًا، قم باختيار مشروع أو أنشئ مشروعًا جديدًا
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 dark:text-slate-500">File System Access API فقط</div>
            <NotificationBell />
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </section>
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
          <ActivityLogViewer compact />
        </footer>
      </main>
    </div>
  )
}
