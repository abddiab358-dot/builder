import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useWorkers } from '../hooks/useWorkers'
import { WorkerForm } from '../components/workers/WorkerForm'
import { WorkerList } from '../components/workers/WorkerList'
import { BackButton } from '../components/ui/BackButton'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function ProjectWorkersPage() {
  const { id } = useParams<{ id: string }>()
  const { data: projects } = useProjects()
  const { data: workers, createWorker, deleteWorker } = useWorkers(id)
  const [workerToDeleteId, setWorkerToDeleteId] = useState<string | null>(null)

  if (!id) return null

  const project = (projects ?? []).find((p) => p.id === id)

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">العمال المرتبطون بالمشروع</h2>
          {project && <p className="text-xs text-slate-600">{project.title}</p>}
        </div>
        <BackButton fallbackPath={`/projects/${id}`} />
      </div>

      <WorkerForm
        projectId={id}
        onSubmit={async (values) => {
          await createWorker(values as any)
        }}
      />

      <WorkerList workers={workers ?? []} onDelete={(wid) => setWorkerToDeleteId(wid)} />

      <ConfirmDialog
        open={!!workerToDeleteId}
        title="تأكيد حذف العامل"
        description="هل أنت متأكد من حذف هذا العامل من هذا المشروع؟ لن يتم حذف أي بيانات من المشاريع الأخرى."
        confirmLabel="نعم، حذف العامل"
        cancelLabel="إلغاء"
        tone="danger"
        onCancel={() => setWorkerToDeleteId(null)}
        onConfirm={async () => {
          if (!workerToDeleteId) return
          await deleteWorker(workerToDeleteId)
          setWorkerToDeleteId(null)
        }}
      />
    </div>
  )
}
