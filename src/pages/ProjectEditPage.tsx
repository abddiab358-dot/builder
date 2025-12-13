import { useNavigate, useParams } from 'react-router-dom'
import { ProjectForm } from '../components/projects/ProjectForm'
import { useProjects } from '../hooks/useProjects'
import { BackButton } from '../components/ui/BackButton'

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, updateProject } = useProjects()
  const navigate = useNavigate()

  if (!id) return null

  if (isLoading) {
    return <div className="text-sm text-slate-500 text-right">جاري تحميل بيانات المشروع...</div>
  }

  const project = (data ?? []).find((p) => p.id === id)
  if (!project) {
    return <div className="text-sm text-red-600 text-right">لم يتم العثور على المشروع المطلوب.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 text-right">تعديل بيانات المشروع</h2>
        <BackButton fallbackPath={`/projects/${id}`} />
      </div>
      <ProjectForm
        initial={project}
        submitLabel="حفظ التعديلات"
        onSubmit={async (values) => {
          await updateProject(id, values as any)
          navigate(`/projects/${id}`)
        }}
      />
    </div>
  )
}
