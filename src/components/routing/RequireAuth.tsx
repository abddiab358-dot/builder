import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface RequireAuthProps {
  children: React.ReactNode
  requiredRole?: 'manager' | 'staff' | 'viewer'
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block">
            <svg className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user || !user.isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // التحقق من الصلاحيات
  if (requiredRole) {
    const roleHierarchy = { manager: 3, staff: 2, viewer: 1 }
    const userLevel = roleHierarchy[user.role]
    const requiredLevel = roleHierarchy[requiredRole]

    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center card rounded-lg p-8 max-w-md w-full m-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 4v2m0 4v2M6.73 3h10.54a2 2 0 011.96 1.5l1.54 6a2 2 0 01-1.96 2.5H4.67a2 2 0 01-1.96-2.5l1.54-6A2 2 0 016.73 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              صلاحيات غير كافية
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ليس لديك صلاحيات للوصول إلى هذه الصفحة
            </p>
          </div>
        </div>
      )
    }
  }

  return children
}
