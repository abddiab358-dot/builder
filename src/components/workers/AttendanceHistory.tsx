import { DailyChecklistItem } from '../../types/domain'

interface AttendanceHistoryProps {
    items: DailyChecklistItem[]
    onSelectDate: (date: string) => void
}

export function AttendanceHistory({ items, onSelectDate }: AttendanceHistoryProps) {
    // Group items by date
    const groups = items.reduce((acc, item) => {
        if (!acc[item.date]) {
            acc[item.date] = []
        }
        acc[item.date].push(item)
        return acc
    }, {} as Record<string, DailyChecklistItem[]>)

    // Sort dates descending
    const dates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    if (dates.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                لا يوجد سجلات حضور وغياب سابقة
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dates.map((date) => {
                const dayItems = groups[date]
                const presentCount = dayItems.filter((i) => i.present).length
                const absentCount = dayItems.filter((i) => !i.present).length
                const total = dayItems.length

                return (
                    <button
                        key={date}
                        onClick={() => onSelectDate(date)}
                        className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all text-right group"
                    >
                        <div className="flex justify-between items-center w-full">
                            <div className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                                {new Date(date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                عرض التفاصيل &larr;
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-100 dark:bg-slate-700" />

                        <div className="flex justify-between w-full text-sm">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-slate-500 dark:text-slate-400">حاضر</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">{presentCount}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-slate-500 dark:text-slate-400">غائب</span>
                                <span className="font-semibold text-red-600 dark:text-red-400">{absentCount}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-100 dark:bg-slate-700" />
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-slate-500 dark:text-slate-400">الإجمالي</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span>
                            </div>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
