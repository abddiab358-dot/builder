import { Project } from '../../types/domain'
import { ProjectCard } from './ProjectCard'

interface Props {
  projects: Project[]
  onDelete?: (id: string) => void
}

export function ProjectList({ projects, onDelete }: Props) {
  if (!projects.length) {
    return <div className="text-sm text-slate-500 text-right">لا توجد مشاريع بعد، قم بإضافة مشروع جديد.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  )
}
