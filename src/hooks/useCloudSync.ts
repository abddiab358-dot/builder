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
      // التحقق من دعم File System Access API (للحاسوب)
      // @ts-ignore
      if (typeof window.showDirectoryPicker !== 'undefined') {
        const dirHandle = await window.showDirectoryPicker()
        if (!dirHandle) {
          throw new Error('User cancelled')
        }
        await saveSyncDirectoryHandle(dirHandle)
      } else {
        // للموبايل: نعتبر الاتصال ناجحاً ولكن سنستخدم المشاركة اليدوية عند المزامنة
        console.log('Mobile device detected: Using manual share for sync')
      }

      const newSettings: CloudSyncSettings = {
        enabled: true,
        provider: 'google',
        accessToken: 'local-folder-token',
        autoSync: false,
        syncInterval: 30,
      }

      await saveSettings(newSettings)
      return { success: true, message: 'تم تفعيل المزامنة مع Google Drive بنجاح' }
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
      // 1. تجميع كل البيانات
      const payload: Record<string, any> = {}
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
      for (let i = 0; i < files.length; i++) {
        const filename = files[i]
        const sourceHandle = handlesMap[filename]
        if (sourceHandle) {
          const data = await readJSONFileHandle(sourceHandle)
          if (data) {
            const key = filename.replace('.json', '') // projects.json -> projects
            payload[key] = data
          }
        }
      }

      // 2. محاولة الحفظ في المجلد المربوط (للحاسوب)
      let savedToFolder = false
      try {
        const syncDir = await getSyncDirectoryHandle()
        if (syncDir) {
          // إذا وجدنا مجلد مربوط، نحفظ الملفات فيه
          for (let i = 0; i < files.length; i++) {
            const filename = files[i]
            setSyncProgress(Math.round((i / files.length) * 100))
            const data = payload[filename.replace('.json', '')]
            if (data) {
              // @ts-ignore
              const targetFileHandle = await syncDir.getFileHandle(filename, { create: true })
              await saveJSONFileHandle(targetFileHandle, data)
            }
          }
          savedToFolder = true
        }
      } catch (err) {
        console.warn('Failed to save to sync folder, falling back to share', err)
      }

      if (savedToFolder) {
        setSyncProgress(100)
        const result: SyncResult = {
          success: true,
          message: `تم نسخ البيانات بنجاح إلى المجلد المحلي`,
          syncedItems: files.length,
          timestamp: new Date().toISOString(),
        }
        setLastSyncResult(result)
        await saveSettings({ ...syncSettings, lastSyncTime: new Date().toISOString() })
        return result
      }

      // 3. (للموبايل) إذا لم يتم الحفظ في مجلد، نستخدم المشاركة
      const filename = `sync-data-${new Date().toISOString().slice(0, 10)}.json`
      const jsonStr = JSON.stringify(payload, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const file = new File([blob], filename, { type: 'application/json' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'مزامنة البيانات',
          text: 'ملف مزامنة بيانات برنامج المقاولات'
        })
        const result: SyncResult = {
          success: true,
          message: 'تمت مشاركة ملف المزامنة بنجاح',
          syncedItems: 1,
          timestamp: new Date().toISOString(),
        }
        setLastSyncResult(result)
        await saveSettings({ ...syncSettings, lastSyncTime: new Date().toISOString() })
        return result
      } else {
        // Fallback download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        const result: SyncResult = {
          success: true,
          message: 'تم تنزيل ملف المزامنة',
          syncedItems: 1,
          timestamp: new Date().toISOString(),
        }
        setLastSyncResult(result)
        await saveSettings({ ...syncSettings, lastSyncTime: new Date().toISOString() })
        return result
      }

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
