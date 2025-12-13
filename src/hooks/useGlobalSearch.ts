import { useMemo } from 'react'
import { useProjects } from './useProjects'
import { useTasks } from './useTasks'
import { useClients } from './useClients'
import { useWorkers } from './useWorkers'

export interface SearchResult {
  type: 'project' | 'task' | 'client' | 'worker'
  id: string
  title: string
  subtitle?: string
  description?: string
  icon: string
  link: string
}

export function useGlobalSearch(query: string): SearchResult[] {
  const { data: projects } = useProjects()
  const { data: tasks } = useTasks()
  const { data: clients } = useClients()
  const { data: workers } = useWorkers()

  return useMemo(() => {
    if (!query.trim()) return []

    const normalizedQuery = query.toLowerCase().trim()
    const results: SearchResult[] = []

    // البحث في المشاريع
    projects?.forEach((project) => {
      if (
        project.title.toLowerCase().includes(normalizedQuery) ||
        project.clientName.toLowerCase().includes(normalizedQuery) ||
        project.address?.toLowerCase().includes(normalizedQuery) ||
        project.description?.toLowerCase().includes(normalizedQuery)
      ) {
        results.push({
          type: 'project',
          id: project.id,
          title: project.title,
          subtitle: `عميل: ${project.clientName}`,
          description: project.address,
          icon: '📋',
          link: `/projects/${project.id}`,
        })
      }
    })

    // البحث في المهام
    tasks?.forEach((task) => {
      if (
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description?.toLowerCase().includes(normalizedQuery)
      ) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          subtitle: `الحالة: ${task.status}`,
          description: task.description,
          icon: '✓',
          link: `/projects`,
        })
      }
    })

    // البحث في العملاء
    clients?.forEach((client) => {
      if (
        client.name.toLowerCase().includes(normalizedQuery) ||
        client.phone?.toLowerCase().includes(normalizedQuery) ||
        client.address?.toLowerCase().includes(normalizedQuery)
      ) {
        results.push({
          type: 'client',
          id: client.id,
          title: client.name,
          subtitle: `عميل`,
          description: client.address || client.phone,
          icon: '👤',
          link: `/clients`,
        })
      }
    })

    // البحث في العمال
    workers?.forEach((worker) => {
      if (
        worker.name.toLowerCase().includes(normalizedQuery) ||
        worker.phone?.toLowerCase().includes(normalizedQuery) ||
        worker.role?.toLowerCase().includes(normalizedQuery)
      ) {
        results.push({
          type: 'worker',
          id: worker.id,
          title: worker.name,
          subtitle: `${worker.role || 'عامل'}`,
          description: worker.phone,
          icon: '👷',
          link: `/projects`,
        })
      }
    })

    return results.slice(0, 20) // حد أقصى 20 نتيجة
  }, [query, projects, tasks, clients, workers])
}
