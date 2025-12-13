import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { ImageUploader } from '../components/files/ImageUploader'
import { useProjectFiles } from '../hooks/useProjectFiles'
import { BackButton } from '../components/ui/BackButton'

export function ProjectFilesPage() {
  const { id } = useParams<{ id: string }>()
  const { data: projects } = useProjects()
  const { data, isLoading } = useProjectFiles(id)

  if (!id) return null

  const project = (projects ?? []).find((p) => p.id === id)

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">ملفات وصور المشروع</h2>
          {project && <p className="text-xs text-slate-600">{project.title}</p>}
        </div>
        <BackButton fallbackPath={`/projects/${id}`} />
      </div>

      <ImageUploader projectId={id} />

      {isLoading && <div className="text-xs text-slate-500">جاري تحميل الملفات...</div>}
      {!isLoading && !(data ?? []).length && (
        <div className="text-xs text-slate-500">لا توجد ملفات حتى الآن.</div>
      )}
    </div>
  )
}
