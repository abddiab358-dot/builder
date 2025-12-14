import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { readJSONFileHandle, saveJSONFileHandle } from '../storage/fileSystem'

export function useJsonCollection<T extends { id: string }>(
  key: string,
  handle: FileSystemFileHandle | undefined,
) {
  const queryClient = useQueryClient()

  const query = useQuery<T[]>({
    queryKey: [key],
    enabled: !!handle,
    queryFn: async () => {
      if (!handle) return []
      const data = await readJSONFileHandle<T[]>(handle)
      return Array.isArray(data) ? data : []
    },
  })

  const mutation = useMutation({
    mutationFn: async (updater: (items: T[]) => T[]) => {
      if (!handle) throw new Error('لا يوجد ملف مرتبط بهذه البيانات')
      const current = (await readJSONFileHandle<T[]>(handle)) ?? []
      const next = updater(Array.isArray(current) ? current : [])
      await saveJSONFileHandle(handle, next)
      return next
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] })
    },
  })

  return {
    ...query,
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
  }
}
