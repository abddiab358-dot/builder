import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFileSystem } from '../context/FileSystemContext'
import { readJSONFileHandle, saveJSONFileHandle } from '../storage/fileSystem'
import { Settings } from '../types/domain'

const SETTINGS_KEY = 'file:settings.json'
const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  language: 'ar',
  notificationsEnabled: true,
  theme: 'light',
}

// Safe storage wrapper (localStorage + in-memory fallback)
let inMemorySettings: Settings = DEFAULT_SETTINGS
function safeGetSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.warn('Failed to read settings from localStorage:', e)
  }
  return inMemorySettings
}

function safeSaveSettings(data: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data))
    inMemorySettings = data
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e)
    inMemorySettings = data
  }
}

export function useSettings() {
  const { settings } = useFileSystem()
  const queryClient = useQueryClient()

  const query = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      // Try FileSystem handle first
      if (settings) {
        try {
          const data = await readJSONFileHandle<Settings>(settings)
          if (data) return data
        } catch (e) {
          console.warn('Failed to read from FileSystem, using localStorage:', e)
        }
      }
      // Fallback to localStorage
      return safeGetSettings()
    },
    staleTime: Infinity, // Don't refetch unless explicitly invalidated
  })

  const mutation = useMutation({
    mutationFn: async (patch: Partial<Settings>) => {
      const current = query.data || safeGetSettings()
      const next: Settings = { ...current, ...patch }
      
      // Try FileSystem handle first
      if (settings) {
        try {
          await saveJSONFileHandle(settings, next)
        } catch (e) {
          console.warn('Failed to save to FileSystem, using localStorage:', e)
          safeSaveSettings(next)
        }
      } else {
        // Use localStorage
        safeSaveSettings(next)
      }
      
      return next
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  return {
    ...query,
    data: query.data || DEFAULT_SETTINGS,
    update: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  }
}
