import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import { TaskList } from '../components/tasks/TaskList'
import { TaskStatus } from '../types/domain'
import { useWorkers } from '../hooks/useWorkers'
import { BackButton } from '../components/ui/BackButton'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function ProjectTasksPage() {
  const { id } = useParams<{ id: string }>()
  const { data: allTasks, createTask, updateTask, deleteTask } = useTasks(id)
  const { data: projects } = useProjects()
  const { data: workers } = useWorkers(id)
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null)

  if (!id) return null

  const project = (projects ?? []).find((p) => p.id === id)

  const handleAddTask = async () => {
    if (!title.trim()) return
    await createTask({
      projectId: id,
      title: title.trim(),
      description: description.trim() || undefined,
      assignedTo: assignedTo || undefined,
      status: 'todo',
      dueDate: dueDate || undefined,
    } as any)
    setTitle('')
    setDescription('')
    setAssignedTo('')
    setDueDate('')
  }

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">مهام المشروع</h2>
          {project && <p className="text-xs text-slate-600">{project.title}</p>}
        </div>
        <BackButton fallbackPath={`/projects/${id}`} />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            placeholder="عنوان المهمة"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">تعيين إلى عامل (اختياري)</option>
            {(workers ?? []).map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddTask}
            className="px-3 py-2 rounded-md text-sm bg-primary-600 text-white hover:bg-primary-700"
          >
            إضافة مهمة
          </button>
        </div>
        <textarea
          rows={2}
          placeholder="وصف المهمة (اختياري)"
          className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <TaskList
        tasks={allTasks ?? []}
        onStatusChange={async (taskId, status: TaskStatus) => updateTask(taskId, { status } as any)}
        onDelete={(taskId) => setTaskToDeleteId(taskId)}
      />

      <ConfirmDialog
        open={!!taskToDeleteId}
        title="تأكيد حذف المهمة"
        description="هل أنت متأكد من حذف هذه المهمة من المشروع؟ لا يمكن التراجع عن هذه العملية."
        confirmLabel="نعم، حذف المهمة"
        cancelLabel="إلغاء"
        tone="danger"
        onCancel={() => setTaskToDeleteId(null)}
        onConfirm={async () => {
          if (!taskToDeleteId) return
          await deleteTask(taskToDeleteId)
          setTaskToDeleteId(null)
        }}
      />
    </div>
  )
}
