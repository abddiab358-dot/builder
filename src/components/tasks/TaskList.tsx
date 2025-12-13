import { Task } from '../../types/domain'

interface Props {
  tasks: Task[]
  onStatusChange?: (id: string, status: Task['status']) => void
  onDelete?: (id: string) => void
}

export function TaskList({ tasks, onStatusChange, onDelete }: Props) {
  if (!tasks.length) {
    return <div className="text-sm text-slate-500 text-right">لا توجد مهام بعد.</div>
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col gap-1 text-right"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium text-slate-900">{task.title}</div>
            {onStatusChange && (
              <select
                className="text-xs border rounded-md px-2 py-1 bg-white"
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
              >
                <option value="todo">قيد التخطيط</option>
                <option value="in_progress">جارٍ التنفيذ</option>
                <option value="done">منجز</option>
                <option value="blocked">متوقف</option>
              </select>
            )}
          </div>
          {task.description && <div className="text-xs text-slate-600">{task.description}</div>}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <div className="flex gap-2">
              {task.assignedTo && <span>مكلّف لـ: {task.assignedTo}</span>}
              {task.dueDate && (
                <span>
                  تاريخ التسليم: {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                </span>
              )}
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="px-2 py-1 rounded-md text-[11px] bg-red-50 text-red-600 hover:bg-red-100"
              >
                حذف
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
