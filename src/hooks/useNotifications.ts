import { useActivity } from './useActivity'
import { createId } from '../utils/id'

export interface Notification {
    id: string
    type: 'info' | 'warning' | 'success' | 'error' | 'project_deadline'
    message: string
    projectId?: string
    entity?: string
    entityId?: string
    isRead: boolean
    createdAt: string
    dueDate?: string // For deadline notifications
}

export function useNotifications() {
    const { log } = useActivity()

    // This is a simplified version effectively acting as a "toaster" or "logger"
    // Since we don't have a full global notification context visible in the chat history,
    // we will implement a basic one that logs to activity and maybe could be expanded to a context.
    // For now, satisfy the useProjects interface.

    const notify = async (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
        // In a real app, this would push to a global state or database
        console.log('Notification:', notification)

        // Log it as an activity too if needed, but useActivity handles that separate.
        // We can save to a 'notifications.json' if we want persistent in-app notifications.
    }

    return {
        notify
    }
}
