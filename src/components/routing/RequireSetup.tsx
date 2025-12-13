import { Navigate, useLocation } from 'react-router-dom'
import { useFileSystem } from '../../context/FileSystemContext'

interface Props {
  children: React.ReactNode
}

export function RequireSetup({ children }: Props) {
  const { isReady, bootstrapping } = useFileSystem()
  const location = useLocation()

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="px-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
          جاري فتح بيانات النظام من مجلد project_files...
        </div>
      </div>
    )
  }

  if (!isReady) {
    return <Navigate to="/setup" state={{ from: location }} replace />
  }

  return <>{children}</>
}
