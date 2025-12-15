import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { DailyChecklistItem } from '../types/domain'

export function useAttendance() {
    const { attendance } = useFileSystem()
    const collection = useJsonCollection<DailyChecklistItem>('attendance', attendance)

    const getAttendanceByDate = (date: string) => {
        return (collection.data ?? []).filter((item) => item.date === date)
    }

    const saveAttendance = async (items: DailyChecklistItem[]) => {
        // We need to merge new items with existing ones, replacing those that match (id) or (date+workerId)
        // Actually, simplest strategy for a date-based view is:
        // 1. Get all items NOT for this date
        // 2. Add the new items for this date
        // 3. Save all

        if (items.length === 0) return

        const date = items[0].date
        const otherItems = (collection.data ?? []).filter((item) => item.date !== date)
        const newAllItems = [...otherItems, ...items]

        await collection.save(() => newAllItems)
    }

    return {
        ...collection,
        getAttendanceByDate,
        saveAttendance,
    }
}
