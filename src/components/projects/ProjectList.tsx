import { Project } from '../../types/domain'
import { ProjectCard } from './ProjectCard'

interface Props {
  projects: Project[]
  onDelete?: (id: string) => void
}

export function ProjectList({ projects, onDelete }: Props) {
  if (!projects.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold mb-2">لا توجد مشاريع بعد</p>
        <p className="text-slate-500 dark:text-slate-500 text-sm max-w-sm">
          ابدأ بإنشاء مشروع جديد لتتمكن من إدارة مشاريعك والمهام المرتبطة بها
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  )
}
