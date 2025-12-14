import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useWorkers } from '../hooks/useWorkers'
import { WorkerForm } from '../components/workers/WorkerForm'
import { WorkerList } from '../components/workers/WorkerList'
import { DailyChecklistTable } from '../components/workers/DailyChecklistTable'
import { BackButton } from '../components/ui/BackButton'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { Worker } from '../types/domain'

export function ProjectWorkersPage() {
  const { id } = useParams<{ id: string }>()
  const { data: projects } = useProjects()
  const { data: workers, createWorker, deleteWorker, updateWorker } = useWorkers(id)
  const [workerToDeleteId, setWorkerToDeleteId] = useState<string | null>(null)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)

  if (!id) return null

  const project = (projects ?? []).find((p) => p.id === id)

  const handleOpenEdit = (worker: Worker) => {
    setEditingWorker(worker)
    setEditModalOpen(true)
  }

  const handleSaveEdit = async (updatedWorker: Worker) => {
    if (!editingWorker) return
    try {
      await updateWorker(editingWorker.id, updatedWorker)
      setEditModalOpen(false)
      setEditingWorker(null)
    } catch (error) {
      console.error('خطأ في تحديث العامل:', error)
    }
  }

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">العمال المرتبطون بالمشروع</h2>
          {project && <p className="text-xs text-slate-600 dark:text-slate-400">{project.title}</p>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowChecklist(!showChecklist)}
            className="px-3 py-1.5 rounded-md text-xs bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {showChecklist ? 'إخفاء التفقد اليومي' : 'عرض التفقد اليومي'}
          </button>
          <BackButton fallbackPath={`/projects/${id}`} />
        </div>
      </div>

      <WorkerForm
        projectId={id}
        onSubmit={async (values) => {
          await createWorker(values as any)
        }}
      />

      {showChecklist && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <DailyChecklistTable
            workers={workers ?? []}
            onSave={async () => {
              // The checklist is for tracking purposes, saves directly
              // In a real app, you might want to save to a separate checklist table
            }}
          />
        </div>
      )}

      <WorkerList 
        workers={workers ?? []} 
        onDelete={(wid) => setWorkerToDeleteId(wid)}
        onEdit={(worker) => handleOpenEdit(worker)}
      />

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

      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingWorker(null)
        }}
        title="تعديل بيانات العامل"
        footer={null}
      >
        {editingWorker && (
          <WorkerEditForm
            worker={editingWorker}
            onSubmit={handleSaveEdit}
            onCancel={() => {
              setEditModalOpen(false)
              setEditingWorker(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

interface WorkerEditFormProps {
  worker: Worker
  onSubmit: (worker: Worker) => Promise<void>
  onCancel: () => void
}

function WorkerEditForm({ worker, onSubmit, onCancel }: WorkerEditFormProps) {
  const [name, setName] = useState(worker.name)
  const [phone, setPhone] = useState(worker.phone || '')
  const [role, setRole] = useState(worker.role || '')
  const [dailyRate, setDailyRate] = useState((worker.dailyRate || '').toString())
  const [notes, setNotes] = useState(worker.notes || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        ...worker,
        name: name.trim(),
        phone: phone.trim() || undefined,
        role: role.trim() || undefined,
        dailyRate: dailyRate ? Number(dailyRate) : undefined,
        notes: notes.trim() || undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">اسم العامل</label>
          <input
            className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">رقم الهاتف</label>
          <input
            className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">الوظيفة / الدور</label>
          <input
            className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">الأجر اليومي (اختياري)</label>
          <input
            type="number"
            min={0}
            className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={dailyRate}
            onChange={(e) => setDailyRate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">ملاحظات</label>
        <textarea
          rows={2}
          className="border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:bg-slate-300"
        >
          حفظ التعديلات
        </button>
      </div>
    </form>
  )
}
