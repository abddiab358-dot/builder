import { useState } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import { readJSONFile, saveJSONFile, createJSONFile, openJSONFile } from '../../storage/fileSystem'

export function BackupManager() {
  const handles = useFileSystem()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const exportBackup = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const payload: Record<string, unknown> = {}

      if (handles.projects) payload.projects = (await readJSONFile(handles.projects)) ?? []
      if (handles.tasks) payload.tasks = (await readJSONFile(handles.tasks)) ?? []
      if (handles.clients) payload.clients = (await readJSONFile(handles.clients)) ?? []
      if (handles.activity) payload.activity = (await readJSONFile(handles.activity)) ?? []
      if (handles.settings) payload.settings = await readJSONFile(handles.settings)
      if (handles.workers) payload.workers = (await readJSONFile(handles.workers)) ?? []
      if (handles.projectFilesMeta)
        payload.projectFilesMeta = (await readJSONFile(handles.projectFilesMeta)) ?? []

      const backupHandle = await createJSONFile(`backup-${new Date().toISOString().slice(0, 10)}.json`)
      if (!backupHandle) return
      await saveJSONFile(backupHandle, payload)
      setMessage('تم إنشاء ملف النسخة الاحتياطية بنجاح.')
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
      const data = (await readJSONFile<Record<string, unknown>>(backupHandle)) ?? {}

      if (handles.projects && Array.isArray(data.projects)) {
        await saveJSONFile(handles.projects, data.projects)
      }
      if (handles.tasks && Array.isArray(data.tasks)) {
        await saveJSONFile(handles.tasks, data.tasks)
      }
      if (handles.clients && Array.isArray(data.clients)) {
        await saveJSONFile(handles.clients, data.clients)
      }
      if (handles.activity && Array.isArray(data.activity)) {
        await saveJSONFile(handles.activity, data.activity)
      }
      if (handles.settings && data.settings) {
        await saveJSONFile(handles.settings, data.settings)
      }
      if (handles.workers && Array.isArray(data.workers)) {
        await saveJSONFile(handles.workers, data.workers)
      }
      if (handles.projectFilesMeta && Array.isArray(data.projectFilesMeta)) {
        await saveJSONFile(handles.projectFilesMeta, data.projectFilesMeta)
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
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 text-right">
      <div className="text-sm font-semibold text-slate-900">النسخ الاحتياطي</div>
      <p className="text-xs text-slate-600">
        يقوم النظام بحفظ بياناتك في ملفات JSON على جهازك. يمكنك إنشاء ملف نسخ احتياطي كامل واستعادته عند الحاجة.
      </p>
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={exportBackup}
          disabled={busy}
          className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700 disabled:bg-slate-300"
        >
          إنشاء نسخة احتياطية
        </button>
        <button
          type="button"
          onClick={importBackup}
          disabled={busy}
          className="px-3 py-1.5 rounded-md text-xs bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:bg-slate-300"
        >
          استيراد نسخة احتياطية
        </button>
      </div>
      {message && <div className="text-xs text-slate-700">{message}</div>}
    </div>
  )
}
