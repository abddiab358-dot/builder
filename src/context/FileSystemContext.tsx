import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isFileSystemAPISupported, createIfNotExists, ensurePermission } from '../storage/fileSystem'
import { getSavedDirectoryHandle } from '../storage/handleStore'
import type { Settings } from '../types/domain'

export interface StorageHandles {
  projects?: FileSystemFileHandle
  tasks?: FileSystemFileHandle
  clients?: FileSystemFileHandle
  activity?: FileSystemFileHandle
  settings?: FileSystemFileHandle
  workers?: FileSystemFileHandle
  projectFilesMeta?: FileSystemFileHandle
  projectFilesDir?: FileSystemDirectoryHandle
  invoices?: FileSystemFileHandle
  payments?: FileSystemFileHandle
  expenses?: FileSystemFileHandle
  workersLog?: FileSystemFileHandle
  dailyReports?: FileSystemFileHandle
  notifications?: FileSystemFileHandle
  permissions?: FileSystemFileHandle
  locations?: FileSystemFileHandle
  smartFund?: FileSystemFileHandle
}

interface FileSystemContextValue extends StorageHandles {
  setHandles: (update: Partial<StorageHandles>) => void
  clearHandles: () => void
  isReady: boolean
  bootstrapping: boolean
}

const FileSystemContext = createContext<FileSystemContextValue | undefined>(undefined)

export const FileSystemProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [handles, setHandlesState] = useState<StorageHandles>({})
  const [bootstrapping, setBootstrapping] = useState(true)

  const setHandles = (update: Partial<StorageHandles>) => {
    setHandlesState((prev) => ({ ...prev, ...update }))
  }

  const clearHandles = () => setHandlesState({})

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      if (!isFileSystemAPISupported()) {
        setBootstrapping(false)
        return
      }

      try {
        const dir = await getSavedDirectoryHandle()
        if (!dir) {
          setBootstrapping(false)
          return
        }

        const ok = await ensurePermission(dir, 'readwrite')
        if (!ok) {
          setBootstrapping(false)
          return
        }

        const ensureFile = async (name: string, initial: unknown) => {
          const handle = await dir.getFileHandle(name, { create: true })
          await createIfNotExists(handle, initial)
          return handle
        }

        const defaultSettings: Settings = {
          id: 'settings',
          language: 'ar',
          notificationsEnabled: true,
          theme: 'light',
        }

        const [
          projects,
          tasks,
          clients,
          activity,
          workers,
          projectFilesMeta,
          settings,
          invoices,
          payments,
          expenses,
          workersLog,
          dailyReports,
          notifications,
          permissions,
          locations,
          smartFund,
        ] = await Promise.all([
          ensureFile('projects.json', []),
          ensureFile('tasks.json', []),
          ensureFile('clients.json', []),
          ensureFile('activity.json', []),
          ensureFile('workers.json', []),
          ensureFile('project_files_meta.json', []),
          ensureFile('settings.json', defaultSettings),
          ensureFile('invoices.json', []),
          ensureFile('payments.json', []),
          ensureFile('expenses.json', []),
          ensureFile('workers_log.json', []),
          ensureFile('daily_reports.json', []),
          ensureFile('notifications.json', []),
          ensureFile('permissions.json', []),
          ensureFile('project_locations.json', []),
          ensureFile('smart_fund.json', []),
        ])

        if (cancelled) return

        setHandlesState({
          projectFilesDir: dir,
          projects,
          tasks,
          clients,
          activity,
          workers,
          projectFilesMeta,
          settings,
          invoices,
          payments,
          expenses,
          workersLog,
          dailyReports,
          notifications,
          permissions,
          locations,
          smartFund,
        })
      } catch {
      } finally {
        if (!cancelled) {
          setBootstrapping(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<FileSystemContextValue>(
    () => ({
      ...handles,
      setHandles,
      clearHandles,
      bootstrapping,
      isReady:
        !!handles.projects &&
        !!handles.tasks &&
        !!handles.clients &&
        !!handles.activity &&
        !!handles.settings &&
        !!handles.projectFilesDir,
    }),
    [handles, bootstrapping],
  )

  return <FileSystemContext.Provider value={value}>{children}</FileSystemContext.Provider>
}

export const useFileSystem = () => {
  const ctx = useContext(FileSystemContext)
  if (!ctx) {
    throw new Error('useFileSystem must be used within FileSystemProvider')
  }
  return ctx
}
