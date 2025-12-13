import { Task } from '../../types/domain'

interface Props {
  tasks: Task[]
  onStatusChange?: (id: string, status: Task['status']) => void
  onDelete?: (id: string) => void
}

export function TaskList({ tasks, onStatusChange, onDelete }: Props) {
  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      todo: 'قيد التخطيط',
      in_progress: 'جارٍ التنفيذ',
      done: 'منجز',
      blocked: 'متوقف',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'in_progress':
        return 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
      case 'done':
        return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'blocked':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    }
  }

  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">لا توجد مهام</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">ابدأ بإضافة مهمة جديدة لهذا المشروع</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 text-right shadow-sm dark:shadow-dark-md hover:shadow-md dark:hover:shadow-dark-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 line-clamp-2">{task.title}</h3>
            </div>
            {onStatusChange && (
              <select
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap border-0 outline-none transition-colors cursor-pointer ${getStatusColor(task.status)}`}
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
          {task.description && <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-3">
              {task.assignedTo && <span>👤 {task.assignedTo}</span>}
              {task.dueDate && (
                <span>
                  📅 {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                </span>
              )}
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium"
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
