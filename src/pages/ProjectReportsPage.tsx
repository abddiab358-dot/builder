import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useDailyReports } from '../hooks/useDailyReports'
import { useProjectFiles } from '../hooks/useProjectFiles'
import { Modal } from '../components/ui/Modal'
import { BackButton } from '../components/ui/BackButton'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function ProjectReportsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: projects } = useProjects()
  const { data: reportsData, createReport, deleteReport } = useDailyReports(id)
  const { data: projectFiles } = useProjectFiles(id)

  const [createOpen, setCreateOpen] = useState(false)
  const [date, setDate] = useState('')
  const [progressPercent, setProgressPercent] = useState('')
  const [notes, setNotes] = useState('')
  const [issues, setIssues] = useState('')
  const [workersCount, setWorkersCount] = useState('')
  const [reportToDeleteId, setReportToDeleteId] = useState<string | null>(null)

  if (!id) return null

  const project = (projects ?? []).find((p) => p.id === id)
  const reports = reportsData ?? []

  const handleCreate = async () => {
    if (!date || !progressPercent) return
    const progress = Number(progressPercent)
    const workers = workersCount ? Number(workersCount) : undefined
    if (Number.isNaN(progress)) return

    await createReport({
      projectId: id,
      date,
      progressPercent: progress,
      notes: notes.trim() || undefined,
      issues: issues.trim() || undefined,
      workersCount: workers,
      photoFileIds: undefined,
    } as any)

    setDate('')
    setProgressPercent('')
    setNotes('')
    setIssues('')
    setWorkersCount('')
    setCreateOpen(false)
  }

  const latestReport = reports[reports.length - 1]
  const imagesCount = (projectFiles ?? []).filter((f) => f.mimeType.startsWith('image/')).length

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">التقارير اليومية للمشروع</h2>
          {project && <p className="text-xs text-slate-600">{project.title}</p>}
        </div>
        <BackButton fallbackPath={`/projects/${id}`} />
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 rounded-md text-xs font-medium bg-primary-600 text-white hover:bg-primary-700"
        >
          + تقرير يومي جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs flex flex-col gap-1">
          <div className="text-slate-500 dark:text-slate-400">عدد التقارير</div>
          <div className="text-base font-semibold text-slate-900 dark:text-slate-50">{reports.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs flex flex-col gap-1">
          <div className="text-slate-500 dark:text-slate-400">آخر نسبة إنجاز مسجلة</div>
          <div className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
            {latestReport ? `${latestReport.progressPercent}%` : '--'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs flex flex-col gap-1">
          <div className="text-slate-500 dark:text-slate-400">عدد الصور المرفوعة للمشروع</div>
          <div className="text-base font-semibold text-slate-900 dark:text-slate-50">{imagesCount}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">سجل التقارير اليومية</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            يمكنك رفع صور اليوم من صفحة "الملفات والصور" وذكرها في ملاحظات التقرير.
          </div>
        </div>
        {reports.length === 0 && <div className="text-xs text-slate-500 dark:text-slate-400">لا توجد تقارير حتى الآن.</div>}
        <div className="space-y-2">
          {reports
            .slice()
            .reverse()
            .map((r) => (
              <div
                key={r.id}
                className="border border-slate-200 rounded-md p-2 flex flex-col gap-1 bg-slate-50/60"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-900">
                    {new Date(r.date).toLocaleDateString('ar-EG')} - إنجاز {r.progressPercent}%
                  </div>
                  <button
                    type="button"
                    onClick={() => setReportToDeleteId(r.id)}
                    className="text-[10px] text-red-600 hover:text-red-700"
                  >
                    حذف
                  </button>
                </div>
                {r.notes && <div className="text-[11px] text-slate-700">ملاحظات: {r.notes}</div>}
                {r.issues && <div className="text-[11px] text-amber-700">مشكلات: {r.issues}</div>}
                {r.workersCount != null && (
                  <div className="text-[11px] text-slate-600">عدد العمال في الموقع: {r.workersCount}</div>
                )}
              </div>
            ))}
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="تسجيل تقرير يومي جديد"
        footer={
          <div className="flex justify-between w-full">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
            >
              حفظ التقرير
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">تاريخ التقرير</label>
              <input
                type="date"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">نسبة الإنجاز %</label>
              <input
                type="number"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={progressPercent}
                onChange={(e) => setProgressPercent(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">عدد العمال في الموقع (اختياري)</label>
              <input
                type="number"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={workersCount}
                onChange={(e) => setWorkersCount(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">ملاحظات اليوم</label>
            <textarea
              rows={3}
              className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">المشكلات / الملاحظات الهامة</label>
            <textarea
              rows={3}
              className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!reportToDeleteId}
        title="تأكيد حذف التقرير اليومي"
        description="هل أنت متأكد من حذف هذا التقرير اليومي؟ ستفقد بياناته من سجل المشروع ولا يمكن التراجع."
        confirmLabel="نعم، حذف التقرير"
        cancelLabel="إلغاء"
        tone="danger"
        onCancel={() => setReportToDeleteId(null)}
        onConfirm={async () => {
          if (!reportToDeleteId) return
          await deleteReport(reportToDeleteId)
          setReportToDeleteId(null)
        }}
      />
    </div>
  )
}
