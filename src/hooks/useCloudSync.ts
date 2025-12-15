import { useState, useCallback, useEffect } from 'react'
import { CloudSyncSettings, CloudProvider } from '../types/domain'
import { useJsonCollection } from './useJsonCollection'
import { useFileSystem } from '../context/FileSystemContext'
import {
  saveSyncDirectoryHandle,
  getSyncDirectoryHandle,
} from '../storage/handleStore'
import { saveJSONFileHandle, readJSONFileHandle } from '../storage/fileSystem'

interface SyncResult {
  success: boolean
  message: string
  syncedItems: number
  timestamp: string
}

export function useCloudSync() {
  const { settings: settingsHandle, ...allHandles } = useFileSystem()
  const [syncSettings, setSyncSettings] = useState<CloudSyncSettings>({
    enabled: false,
    provider: 'none',
    autoSync: false,
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [syncProgress, setSyncProgress] = useState(0)

  // تحميل الإعدادات المحفوظة
  const { data: allSettings = [] } = useJsonCollection('settings.json', settingsHandle)

  const loadSettings = useCallback(() => {
    const settings = allSettings?.find?.((s: any) => s.provider) as CloudSyncSettings | undefined
    if (settings) {
      setSyncSettings(settings)
    }
  }, [allSettings])

  // حفظ إعدادات المزامنة
  const saveSettings = useCallback(async (newSettings: CloudSyncSettings) => {
    setSyncSettings(newSettings)
    try {
      // سيتم حفظها في settings.json الرئيسي
      const settingsData = {
        ...newSettings,
        lastSyncTime: new Date().toISOString(),
      }
      localStorage.setItem('cloudSyncSettings', JSON.stringify(settingsData))
    } catch (error) {
      console.error('Failed to save cloud sync settings:', error)
    }
  }, [])

  // بدلاً من تسجيل الدخول OAuth، نطلب من المستخدم اختيار مجلد Google Drive
  const authenticateGoogle = useCallback(async () => {
    setIsSyncing(true)
    try {
      // @ts-ignore - showDirectoryPicker might not be in TS definition
      const dirHandle = await window.showDirectoryPicker()
      if (!dirHandle) {
        throw new Error('User cancelled')
      }

      await saveSyncDirectoryHandle(dirHandle)

      const newSettings: CloudSyncSettings = {
        enabled: true,
        provider: 'google', // We still call it google for UI purposes
        accessToken: 'local-folder-token', // Dummy token to satisfy type
        autoSync: false,
        syncInterval: 30,
      }

      await saveSettings(newSettings)
      return { success: true, message: 'تم ربط مجلد Google Drive بنجاح' }
    } catch (error) {
      console.error('Folder selection failed:', error)
      return { success: false, message: 'فشل ربط المجلد' }
    } finally {
      setIsSyncing(false)
    }
  }, [saveSettings])

  // إلغاء Microsoft حالياً
  const authenticateMicrosoft = useCallback(async () => {
    return { success: false, message: 'غير مدعوم حالياً' }
  }, [])

  // مزامنة البيانات
  const syncData = useCallback(async () => {
    if (!syncSettings.enabled || syncSettings.provider === 'none') {
      return { success: false, message: 'المزامنة معطلة' }
    }

    setIsSyncing(true)
    setSyncProgress(0)

    try {
      const syncDir = await getSyncDirectoryHandle()
      if (!syncDir) {
        throw new Error('لم يتم العثور على المجلد المرتبط. يرجى إعادة الربط.')
      }

      // قائمة الملفات المراد نسخها
      const handlesMap: Record<string, FileSystemFileHandle | undefined> = {
        'projects.json': allHandles.projects,
        'tasks.json': allHandles.tasks,
        'clients.json': allHandles.clients,
        'workers.json': allHandles.workers,
        'invoices.json': allHandles.invoices,
        'payments.json': allHandles.payments,
        'expenses.json': allHandles.expenses,
        'daily_reports.json': allHandles.dailyReports,
        'workers_log.json': allHandles.workersLog,
        'attendance.json': allHandles.attendance,
        'permissions.json': allHandles.permissions
      }

      const files = Object.keys(handlesMap)
      let totalItems = 0

      for (let i = 0; i < files.length; i++) {
        const filename = files[i]
        setSyncProgress(Math.round((i / files.length) * 100))

        const sourceHandle = handlesMap[filename]
        if (sourceHandle) {
          // Read source
          const data = await readJSONFileHandle(sourceHandle)
          if (data) {
            // Write to sync dir
            // @ts-ignore
            const targetFileHandle = await syncDir.getFileHandle(filename, { create: true })
            await saveJSONFileHandle(targetFileHandle, data)
            totalItems++
          }
        }
      }

      setSyncProgress(100)

      const result: SyncResult = {
        success: true,
        message: `تم نسخ البيانات بنجاح إلى المجلد المحلي (${totalItems} ملف)`,
        syncedItems: totalItems,
        timestamp: new Date().toISOString(),
      }

      setLastSyncResult(result)

      // تحديث وقت المزامنة الأخيرة
      await saveSettings({
        ...syncSettings,
        lastSyncTime: new Date().toISOString(),
      })

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل غير معروف'
      const result: SyncResult = {
        success: false,
        message: `فشل المزامنة: ${errorMessage}`,
        syncedItems: 0,
        timestamp: new Date().toISOString(),
      }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
      setSyncProgress(0)
    }
  }, [syncSettings, saveSettings, allHandles])

  // فصل الحساب السحابي
  const disconnect = useCallback(async () => {
    const newSettings: CloudSyncSettings = {
      enabled: false,
      provider: 'none',
      autoSync: false,
    }
    await saveSettings(newSettings)
    // Maybe clear handle from IDB? 
    // await clearSavedDirectoryHandle() // No, that's root. clearSyncDirectoryHandle needed if we implemented it.
  }, [saveSettings])

  return {
    syncSettings,
    saveSettings,
    authenticateGoogle,
    authenticateMicrosoft,
    syncData,
    disconnect,
    isSyncing,
    syncProgress,
    lastSyncResult,
    loadSettings,
  }
}
