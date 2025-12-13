import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { ProjectDetail } from '../components/projects/ProjectDetail'
import { BackButton } from '../components/ui/BackButton'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useProjects()

  if (!id) return null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading"></div>
        <span className="text-sm text-slate-600 dark:text-slate-400 mr-3">جاري تحميل بيانات المشروع...</span>
      </div>
    )
  }

  const project = (data ?? []).find((p) => p.id === id)
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">لم يتم العثور على المشروع</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">المشروع الذي تحاول الوصول إليه غير موجود</p>
        <BackButton fallbackPath="/projects" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-end gap-3">
        <BackButton fallbackPath="/projects" />
      </div>
      <ProjectDetail project={project} />
    </div>
  )
}
