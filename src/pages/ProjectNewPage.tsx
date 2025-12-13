import { useNavigate } from 'react-router-dom'
import { ProjectForm } from '../components/projects/ProjectForm'
import { useProjects } from '../hooks/useProjects'
import { BackButton } from '../components/ui/BackButton'

export function ProjectNewPage() {
  const { createProject } = useProjects()
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 text-right">إضافة مشروع جديد</h2>
        <BackButton fallbackPath="/projects" />
      </div>
      <ProjectForm
        submitLabel="حفظ المشروع"
        onSubmit={async (values) => {
          await createProject(values as any)
          navigate('/projects')
        }}
      />
    </div>
  )
}
