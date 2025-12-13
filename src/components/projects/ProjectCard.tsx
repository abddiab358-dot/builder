import { Link } from 'react-router-dom'
import { Project } from '../../types/domain'

interface Props {
  project: Project
  onDelete?: (id: string) => void
}

export function ProjectCard({ project, onDelete }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'in_progress':
        return 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'on_hold':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      planned: 'مخطط',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      on_hold: 'موقوف',
      cancelled: 'ملغى',
    }
    return labels[status] || status
  }

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 text-right shadow-sm dark:shadow-dark-md hover:shadow-md dark:hover:shadow-dark-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="font-bold text-lg text-slate-900 dark:text-slate-50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
          >
            {project.title}
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            العميل: <span className="font-semibold text-slate-700 dark:text-slate-300">{project.clientName}</span>
          </p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${getStatusColor(project.status)}`}>
          {getStatusLabel(project.status)}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {project.address && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{project.address}</span>
          </div>
        )}
        {project.budget != null && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{project.budget.toLocaleString('ar-EG')} ر.س</span>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-2 text-sm py-3 border-t border-slate-200 dark:border-slate-800">
        <Link
          to={`/projects/${project.id}/tasks`}
          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium"
        >
          المهام
        </Link>
        <Link
          to={`/projects/${project.id}/files`}
          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium"
        >
          الملفات
        </Link>
        <Link
          to={`/projects/${project.id}/workers`}
          className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-medium"
        >
          العمال
        </Link>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex gap-2">
          <Link
            to={`/projects/${project.id}/edit`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
          >
            تعديل
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              حذف
            </button>
          )}
        </div>
        <Link
          to={`/projects/${project.id}`}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
        >
          عرض →
        </Link>
      </div>
    </div>
  )
}
