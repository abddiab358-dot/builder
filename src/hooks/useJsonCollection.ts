import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { readJSONFile, saveJSONFile } from '../storage/fileSystem'

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
      const data = await readJSONFile<T[]>(handle)
      return Array.isArray(data) ? data : []
    },
  })

  const mutation = useMutation({
    mutationFn: async (updater: (items: T[]) => T[]) => {
      if (!handle) throw new Error('لا يوجد ملف مرتبط بهذه البيانات')
      const current = (await readJSONFile<T[]>(handle)) ?? []
      const next = updater(current)
      await saveJSONFile(handle, next)
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
