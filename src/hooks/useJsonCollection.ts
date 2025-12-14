import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { readJSONFileHandle, saveJSONFileHandle } from '../storage/fileSystem'

// دوال مساعدة للقراءة والكتابة من localStorage كبديل
async function readFromStorage<T>(key: string, fallback: T): Promise<T> {
  try {
    const stored = localStorage.getItem(`collection:${key}`)
    if (stored) {
      return JSON.parse(stored) as T
    }
  } catch { }
  return fallback
}

async function saveToStorage<T>(key: string, data: T): Promise<void> {
  try {
    localStorage.setItem(`collection:${key}`, JSON.stringify(data))
  } catch { }
}

export function useJsonCollection<T extends { id: string }>(
  key: string,
  handle: FileSystemFileHandle | undefined,
) {
  const queryClient = useQueryClient()

  const query = useQuery<T[]>({
    queryKey: [key],
    queryFn: async () => {
      if (handle) {
        try {
          const data = await readJSONFileHandle<T[]>(handle)
          return Array.isArray(data) ? data : []
        } catch {
          // fallback إلى localStorage إذا فشل FileSystem
          return readFromStorage(key, [])
        }
      }
      // استخدم localStorage إذا لم يكن هناك handle
      return readFromStorage(key, [])
    },
  })

  const mutation = useMutation({
    mutationFn: async (updater: (items: T[]) => T[]) => {
      let current: T[] = []

      // حاول القراءة من FileSystem أولاً
      if (handle) {
        try {
          const data = await readJSONFileHandle<T[]>(handle)
          current = Array.isArray(data) ? data : []
        } catch {
          // fallback إلى localStorage
          current = await readFromStorage(key, [])
        }
      } else {
        // استخدم localStorage إذا لم يكن هناك handle
        current = await readFromStorage(key, [])
      }

      const next = updater(current)

      // حاول الحفظ في FileSystem أولاً
      if (handle) {
        try {
          await saveJSONFileHandle(handle, next)
        } catch {
          // fallback إلى localStorage
          await saveToStorage(key, next)
        }
      } else {
        // استخدم localStorage إذا لم يكن هناك handle
        await saveToStorage(key, next)
      }

      return next
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [key] })
    },
  })

  return {
    ...query,
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
  }
}
