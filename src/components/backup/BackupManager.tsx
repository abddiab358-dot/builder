import { useState } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import { readJSONFile, saveJSONFile, createJSONFile, openJSONFile, saveJSONFileHandle, readJSONFileHandle } from '../../storage/fileSystem'

export function BackupManager() {
  const handles = useFileSystem()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const exportBackup = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const payload: Record<string, unknown> = {}

      if (handles.projects) payload.projects = (await readJSONFileHandle(handles.projects)) ?? []
      if (handles.tasks) payload.tasks = (await readJSONFileHandle(handles.tasks)) ?? []
      if (handles.clients) payload.clients = (await readJSONFileHandle(handles.clients)) ?? []
      if (handles.activity) payload.activity = (await readJSONFileHandle(handles.activity)) ?? []
      if (handles.settings) payload.settings = await readJSONFileHandle(handles.settings)
      if (handles.workers) payload.workers = (await readJSONFileHandle(handles.workers)) ?? []
      if (handles.projectFilesMeta)
        payload.projectFilesMeta = (await readJSONFileHandle(handles.projectFilesMeta)) ?? []

      const filename = `backup-${new Date().toISOString().slice(0, 10)}.json`

      // المحاولة الأولى: استخدام File System Access API (للحاسوب)
      const backupHandle = await createJSONFile(filename)
      if (backupHandle) {
        await saveJSONFileHandle(backupHandle, payload)
        setMessage('تم إنشاء ملف النسخة الاحتياطية بنجاح على جهازك.')
      } else {
        // المحاولة الثانية: استخدام Web Share API أو التنزيل المباشر (للموبايل)
        const jsonStr = JSON.stringify(payload, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })
        const file = new File([blob], filename, { type: 'application/json' })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'نسخة احتياطية',
              text: 'ملف النسخة الاحتياطية لبرنامج المقاولات'
            })
            setMessage('تمت مشاركة النسخة الاحتياطية بنجاح.')
          } catch (shareError) {
            // إذا ألغى المستخدم المشاركة أو فشلت
            if ((shareError as Error).name !== 'AbortError') {
              throw shareError
            }
          }
        } else {
          // المحاولة الثالثة: تنزيل مباشر
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          setMessage('تم تنزيل النسخة الاحتياطية.')
        }
      }
    } catch (e) {
      console.error(e)
      setMessage('حدث خطأ أثناء إنشاء النسخة الاحتياطية.')
    } finally {
      setBusy(false)
    }
  }

  const importBackup = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const backupHandle = await openJSONFile()
      if (!backupHandle) return
      const data = (await readJSONFileHandle<Record<string, unknown>>(backupHandle)) ?? {}

      if (handles.projects && Array.isArray(data.projects)) {
        await saveJSONFileHandle(handles.projects, data.projects)
      }
      if (handles.tasks && Array.isArray(data.tasks)) {
        await saveJSONFileHandle(handles.tasks, data.tasks)
      }
      if (handles.clients && Array.isArray(data.clients)) {
        await saveJSONFileHandle(handles.clients, data.clients)
      }
      if (handles.activity && Array.isArray(data.activity)) {
        await saveJSONFileHandle(handles.activity, data.activity)
      }
      if (handles.settings && data.settings) {
        await saveJSONFileHandle(handles.settings, data.settings)
      }
      if (handles.workers && Array.isArray(data.workers)) {
        await saveJSONFileHandle(handles.workers, data.workers)
      }
      if (handles.projectFilesMeta && Array.isArray(data.projectFilesMeta)) {
        await saveJSONFileHandle(handles.projectFilesMeta, data.projectFilesMeta)
      }

      setMessage('تم استيراد النسخة الاحتياطية بنجاح.')
    } catch (e) {
      console.error(e)
      setMessage('حدث خطأ أثناء استيراد النسخة الاحتياطية.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 text-right shadow-sm dark:shadow-dark-md">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        النسخ الاحتياطي والاستعادة
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        يقوم النظام بحفظ بياناتك في ملفات JSON على جهازك. يمكنك إنشاء نسخة احتياطية كاملة واستعادتها عند الحاجة بكل أمان.
      </p>
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          onClick={exportBackup}
          disabled={busy}
          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-800 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? '⏳ جاري الإنشاء...' : '💾 إنشاء نسخة احتياطية'}
        </button>
        <button
          type="button"
          onClick={importBackup}
          disabled={busy}
          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? '⏳ جاري الاستيراد...' : '📂 استيراد نسخة احتياطية'}
        </button>
      </div>
      {message && (
        <div className={`text-sm p-3 rounded-lg ${message.includes('نجاح')
          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
          {message}
        </div>
      )}
    </div>
  )
}
