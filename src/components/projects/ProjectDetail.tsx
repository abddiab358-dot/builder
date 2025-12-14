import { Link } from 'react-router-dom'
import { Project } from '../../types/domain'

interface Props {
  project: Project
}

export function ProjectDetail({ project }: Props) {
  return (
    <div className="space-y-4 text-right">
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{project.title}</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {project.status === 'planned' && 'مخطط'}
            {project.status === 'in_progress' && 'جارٍ التنفيذ'}
            {project.status === 'completed' && 'مكتمل'}
            {project.status === 'on_hold' && 'موقوف'}
            {project.status === 'cancelled' && 'ملغى'}
          </span>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <div>العميل: {project.clientName || 'غير محدد'}</div>
          {project.address && <div>الموقع: {project.address}</div>}
          <div>
            من{' '}
            {project.startDate && new Date(project.startDate).toLocaleDateString('ar-EG')}{' '}
            {project.endDate && `إلى ${new Date(project.endDate).toLocaleDateString('ar-EG')}`}
          </div>
          {project.budget != null && (
            <div>الميزانية التقديرية: {project.budget.toLocaleString('ar-EG')} ريال</div>
          )}
        </div>
        {project.notes && (
          <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-md p-2">{project.notes}</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link
          to={`/projects/${project.id}/tasks`}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm hover:border-primary-400 dark:hover:border-primary-500 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-50">المهام</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">إدارة مهام التنفيذ والمتابعة</div>
        </Link>
        <Link
          to={`/projects/${project.id}/files`}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm hover:border-primary-400 dark:hover:border-primary-500 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-50">الملفات والصور</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">رفع المخططات والصور وتقارير الموقع</div>
        </Link>
        <Link
          to={`/projects/${project.id}/workers`}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm hover:border-primary-400 dark:hover:border-primary-500 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-50">العمال</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">إدارة العمال المرتبطين بالمشروع</div>
        </Link>
        <Link
          to={`/projects/${project.id}/reports`}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm hover:border-primary-400 dark:hover:border-primary-500 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-50">التقارير اليومية</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">متابعة تقدم التنفيذ والملاحظات اليومية</div>
        </Link>
        <Link
          to={`/projects/${project.id}/finance`}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm hover:border-primary-400 dark:hover:border-primary-500 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-50">المالية والتكاليف</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">إدارة الفواتير والدفعات والمصاريف ويوميات العمال</div>
        </Link>
        <Link
          to={`/projects/${project.id}/timeline`}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm hover:border-primary-400 dark:hover:border-primary-500 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-50">الجدول الزمني</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">عرض مبسط لمواعيد استحقاق المهام على خط زمني</div>
        </Link>
        <Link
          to={`/projects/${project.id}/location`}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm hover:border-primary-400 dark:hover:border-primary-500 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-50">موقع المشروع</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">حفظ إحداثيات المشروع وصورة تمثيلية من الملفات</div>
        </Link>
      </div>
    </div>
  )
}
