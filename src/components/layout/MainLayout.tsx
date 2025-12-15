import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ActivityLogViewer } from '../activity/ActivityLogViewer'
import { NotificationBell } from '../notifications/NotificationBell'
import { SearchBar } from '../search/SearchBar'
import { useAuth } from '../../context/AuthContext'

const navLinkBase =
  'block w-full text-right px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary-50 dark:hover:bg-slate-800'

export function MainLayout() {
  const { user, logout, saveCurrentPath } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // حفظ الموقع الحالي عند التغيير
  useEffect(() => {
    if (location.pathname !== '/dashboard' && saveCurrentPath) {
      saveCurrentPath(location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  const handleNavigate = (path: string) => {
    navigate(path)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'manager':
        return '👨‍💼'
      case 'staff':
        return '👤'
      case 'viewer':
        return '👁️'
      default:
        return '👤'
    }
  }

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'manager':
        return 'مدير'
      case 'staff':
        return 'موظف'
      case 'viewer':
        return 'مشاهدة فقط'
      default:
        return 'مستخدم'
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-900 dark:text-slate-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">نظام المقاولات</h2>
          <div className="w-10"></div>
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative md:translate-x-0 top-0 right-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-sm dark:shadow-dark-md z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } md:mt-0 mt-16`}
      >
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
            onClick={() => handleNavigate('/dashboard')}
            to="/dashboard"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive
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
            onClick={() => handleNavigate('/projects')}
            to="/projects"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive
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

          {user?.role !== 'supervisor' && (
            <NavLink
              onClick={() => handleNavigate('/clients')}
              to="/clients"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive
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
          )}

          <NavLink
            onClick={() => handleNavigate('/settings')}
            to="/settings"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive
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
      <main className="flex-1 flex flex-col w-full md:mt-0 mt-16">
        {/* Header */}
        <header className="px-4 md:px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 shadow-sm dark:shadow-dark-md">
          <div className="flex items-center gap-4 relative">
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <NotificationBell />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="text-lg">{getRoleIcon()}</span>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{user?.name || 'مستخدم'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{getRoleLabel()}</p>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 text-right">
                    <p className="font-medium text-slate-900 dark:text-slate-50">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{getRoleLabel()}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/settings')
                      setShowUserMenu(false)
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-end gap-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                    </svg>
                    الإعدادات
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-end gap-2 text-sm text-red-700 dark:text-red-300 border-t border-slate-200 dark:border-slate-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
          <SearchBar />
          <div className="hidden lg:flex flex-1 text-sm text-slate-600 dark:text-slate-300 text-right font-medium">
            اختر مشروعًا أو أنشئ مشروعًا جديدًا لبدء العمل
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 md:p-4 shadow-sm dark:shadow-dark-md">
          <ActivityLogViewer compact />
        </footer>
      </main>
    </div>
  )
}
