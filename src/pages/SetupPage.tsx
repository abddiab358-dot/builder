import { useNavigate } from 'react-router-dom'
import { useFileSystem } from '../context/FileSystemContext'
import { openDirectory, createIfNotExists } from '../storage/fileSystem'
import { saveDirectoryHandle } from '../storage/handleStore'
import { Settings } from '../types/domain'

export function SetupPage() {
  const navigate = useNavigate()
  const { setHandles, isReady, projectFilesDir } = useFileSystem()

  const handlePickDirectory = async () => {
    const dir = await openDirectory()
    if (!dir) return

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
    ])

    await saveDirectoryHandle(dir)

    setHandles({
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
    })
  }

  const canContinue = isReady

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-6 space-y-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 text-right">تهيئة النظام</h1>
          <span className="text-[11px] px-2 py-1 rounded-full bg-primary-50 text-primary-700">
            خطوة واحدة وتبدأ العمل
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 text-right">
          يعمل هذا النظام بالكامل على جهازك بدون خادم أو قاعدة بيانات. سيتم إنشاء جميع ملفات البيانات تلقائيًا داخل
          المجلد الذي تختاره، ولن تحتاج لاختيار أي ملفات JSON يدويًا. في حال قمت بإغلاق أو تحديث الصفحة لاحقًا، ما عليك إلا
          العودة لهذه الخطوة واختيار نفس المجلد مرة أخرى، وستظهر جميع بياناتك كما هي بدون فقدان.
        </p>

        <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-900/40 flex flex-col gap-3 text-right">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-100">مجلد بيانات المشاريع والملفات project_files</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              سيتم حفظ ملفات المشاريع والصور داخل هذا المجلد، كما سيتم إنشاء (أو استخدام إن كانت موجودة) الملفات التالية
              داخله:
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 mt-1 list-disc list-inside space-y-0.5">
              <li>projects.json - بيانات المشاريع</li>
              <li>tasks.json - بيانات المهام</li>
              <li>clients.json - بيانات العملاء</li>
              <li>activity.json - سجل النشاط</li>
              <li>settings.json - إعدادات النظام</li>
              <li>workers.json - بيانات العمال</li>
              <li>project_files_meta.json - بيانات ملفات المشاريع</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handlePickDirectory}
              className="px-4 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
            >
              اختيار مجلد project_files
            </button>
          </div>
          {projectFilesDir && (
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 text-right">
              تم اختيار مجلد بنجاح وتم تجهيز ملفات البيانات.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-md text-sm font-medium disabled:bg-slate-300 disabled:text-slate-500 bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
          >
            بدء استخدام النظام
          </button>
        </div>
      </div>
    </div>
  )
}
