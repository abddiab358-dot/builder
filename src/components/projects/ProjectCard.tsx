import { Link } from 'react-router-dom'
import { Project } from '../../types/domain'

interface Props {
  project: Project
  onDelete?: (id: string) => void
}

export function ProjectCard({ project, onDelete }: Props) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-2 text-right">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="font-semibold text-slate-900 hover:text-primary-700"
        >
          {project.title}
        </Link>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
          {project.status === 'planned' && 'مخطط'}
          {project.status === 'in_progress' && 'جارٍ التنفيذ'}
          {project.status === 'completed' && 'مكتمل'}
          {project.status === 'on_hold' && 'موقوف'}
          {project.status === 'cancelled' && 'ملغى'}
        </span>
      </div>
      <div className="text-xs text-slate-600 flex flex-wrap gap-2">
        <span>العميل: {project.clientName}</span>
        {project.address && <span>الموقع: {project.address}</span>}
        {project.budget != null && <span>الميزانية: {project.budget.toLocaleString('ar-EG')}</span>}
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-2 text-[11px] text-slate-500">
          <Link to={`/projects/${project.id}/tasks`} className="hover:text-primary-700">
            المهام
          </Link>
          <Link to={`/projects/${project.id}/files`} className="hover:text-primary-700">
            الملفات والصور
          </Link>
          <Link to={`/projects/${project.id}/workers`} className="hover:text-primary-700">
            العمال
          </Link>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/projects/${project.id}/edit`}
            className="px-2 py-1 rounded-md text-[11px] bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            تعديل
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(project.id)}
              className="px-2 py-1 rounded-md text-[11px] bg-red-50 text-red-600 hover:bg-red-100"
            >
              حذف
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
