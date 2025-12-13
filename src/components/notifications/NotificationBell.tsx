import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'

export function NotificationBell() {
  const { data: notifications, markAllRead, markRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const unread = (notifications ?? []).filter((n) => !n.read)
  const unreadCount = unread.length

  const sorted = [...(notifications ?? [])].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  )

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-100 text-xs hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 text-right text-xs">
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="font-semibold text-slate-900 dark:text-slate-100">الإشعارات</div>
            {notifications && notifications.length > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="text-[11px] text-primary-700 hover:underline"
              >
                تعليم الكل كمقروء
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {(!notifications || notifications.length === 0) && (
              <div className="px-3 py-3 text-[11px] text-slate-500">لا توجد إشعارات حالية.</div>
            )}
            {sorted.slice(0, 20).map((n) => (
              <div
                key={n.id}
                className={`px-3 py-2 flex flex-col gap-1 ${!n.read ? 'bg-primary-50/60 dark:bg-slate-800/60' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-medium text-slate-800 dark:text-slate-100 truncate">
                    {n.message}
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markRead(n.id, true)}
                      className="text-[10px] text-primary-700 hover:underline"
                    >
                      تم
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                  <span>
                    {new Date(n.createdAt).toLocaleString('ar-EG', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                  {n.dueDate && (
                    <span className="text-amber-700">
                      استحقاق: {new Date(n.dueDate).toLocaleDateString('ar-EG')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
