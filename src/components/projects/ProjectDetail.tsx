import { Link } from 'react-router-dom'
import { Project } from '../../types/domain'

interface Props {
  project: Project
}

export function ProjectDetail({ project }: Props) {
  return (
    <div className="space-y-4 text-right">
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
            {project.status === 'planned' && 'مخطط'}
            {project.status === 'in_progress' && 'جارٍ التنفيذ'}
            {project.status === 'completed' && 'مكتمل'}
            {project.status === 'on_hold' && 'موقوف'}
            {project.status === 'cancelled' && 'ملغى'}
          </span>
        </div>
        <div className="text-sm text-slate-600 space-y-1">
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
          <div className="mt-2 text-sm text-slate-700 bg-slate-50 rounded-md p-2">{project.notes}</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link
          to={`/projects/${project.id}/tasks`}
          className="bg-white border border-slate-200 rounded-lg p-3 text-sm hover:border-primary-400 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900">المهام</div>
          <div className="text-xs text-slate-500">إدارة مهام التنفيذ والمتابعة</div>
        </Link>
        <Link
          to={`/projects/${project.id}/files`}
          className="bg-white border border-slate-200 rounded-lg p-3 text-sm hover:border-primary-400 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900">الملفات والصور</div>
          <div className="text-xs text-slate-500">رفع المخططات والصور وتقارير الموقع</div>
        </Link>
        <Link
          to={`/projects/${project.id}/workers`}
          className="bg-white border border-slate-200 rounded-lg p-3 text-sm hover:border-primary-400 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900">العمال</div>
          <div className="text-xs text-slate-500">إدارة العمال المرتبطين بالمشروع</div>
        </Link>
        <Link
          to={`/projects/${project.id}/reports`}
          className="bg-white border border-slate-200 rounded-lg p-3 text-sm hover:border-primary-400 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900">التقارير اليومية</div>
          <div className="text-xs text-slate-500">متابعة تقدم التنفيذ والملاحظات اليومية</div>
        </Link>
        <Link
          to={`/projects/${project.id}/finance`}
          className="bg-white border border-slate-200 rounded-lg p-3 text-sm hover:border-primary-400 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900">المالية والتكاليف</div>
          <div className="text-xs text-slate-500">إدارة الفواتير والدفعات والمصاريف ويوميات العمال</div>
        </Link>
        <Link
          to={`/projects/${project.id}/timeline`}
          className="bg-white border border-slate-200 rounded-lg p-3 text-sm hover:border-primary-400 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900">الجدول الزمني</div>
          <div className="text-xs text-slate-500">عرض مبسط لمواعيد استحقاق المهام على خط زمني</div>
        </Link>
        <Link
          to={`/projects/${project.id}/location`}
          className="bg-white border border-slate-200 rounded-lg p-3 text-sm hover:border-primary-400 flex flex-col gap-1"
        >
          <div className="font-semibold text-slate-900">موقع المشروع</div>
          <div className="text-xs text-slate-500">حفظ إحداثيات المشروع وصورة تمثيلية من الملفات</div>
        </Link>
      </div>
    </div>
  )
}
