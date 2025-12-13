import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { ProjectDetail } from '../components/projects/ProjectDetail'
import { BackButton } from '../components/ui/BackButton'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useProjects()

  if (!id) return null

  if (isLoading) {
    return <div className="text-sm text-slate-500 text-right">جاري تحميل بيانات المشروع...</div>
  }

  const project = (data ?? []).find((p) => p.id === id)
  if (!project) {
    return <div className="text-sm text-red-600 text-right">لم يتم العثور على المشروع المطلوب.</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500" />
        <BackButton fallbackPath="/projects" />
      </div>
      <ProjectDetail project={project} />
    </div>
  )
}
