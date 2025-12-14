import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFileSystem } from '../context/FileSystemContext'
import { readJSONFileHandle, saveJSONFileHandle } from '../storage/fileSystem'
import { Settings } from '../types/domain'

export function useSettings() {
  const { settings } = useFileSystem()
  const queryClient = useQueryClient()

  const query = useQuery<Settings | null>({
    queryKey: ['settings'],
    enabled: !!settings,
    queryFn: async () => {
      if (!settings) return null
      return (await readJSONFileHandle<Settings>(settings)) ?? null
    },
  })

  const mutation = useMutation({
    mutationFn: async (patch: Partial<Settings>) => {
      if (!settings) throw new Error('لا يوجد ملف إعدادات مرتبط')
      const current = (await readJSONFileHandle<Settings>(settings)) ?? {
        id: 'settings',
        language: 'ar',
        notificationsEnabled: true,
        theme: 'light',
      }
      const next: Settings = { ...current, ...patch }
      await saveJSONFileHandle(settings, next)
      return next
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  return {
    ...query,
    update: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  }
}
