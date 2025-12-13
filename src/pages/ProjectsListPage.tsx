import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { ProjectList } from '../components/projects/ProjectList'
import { BackButton } from '../components/ui/BackButton'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function ProjectsListPage() {
  const { data, isLoading, deleteProject } = useProjects()

  const [projectToDeleteId, setProjectToDeleteId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">المشاريع</h2>
        <div className="flex items-center gap-2">
          <BackButton fallbackPath="/dashboard" />
          <Link
            to="/projects/new"
            className="px-3 py-1.5 rounded-md text-sm bg-primary-600 text-white hover:bg-primary-700"
          >
            + إضافة مشروع جديد
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-500 text-right">جاري تحميل المشاريع...</div>
      ) : (
        <ProjectList projects={data ?? []} onDelete={(id) => setProjectToDeleteId(id)} />
      )}

      <ConfirmDialog
        open={!!projectToDeleteId}
        title="تأكيد حذف المشروع"
        description="هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع بياناته من هذا النظام ولا يمكن التراجع عن العملية، لكن الملفات تبقى محفوظة في مجلد المشروع على جهازك."
        confirmLabel="نعم، حذف المشروع"
        cancelLabel="إلغاء"
        tone="danger"
        onCancel={() => setProjectToDeleteId(null)}
        onConfirm={async () => {
          if (!projectToDeleteId) return
          await deleteProject(projectToDeleteId)
          setProjectToDeleteId(null)
        }}
      />
    </div>
  )
}
