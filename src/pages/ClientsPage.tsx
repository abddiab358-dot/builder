import { useState } from 'react'
import { useClients } from '../hooks/useClients'
import { ClientForm } from '../components/clients/ClientForm'
import { BackButton } from '../components/ui/BackButton'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function ClientsPage() {
  const { data, isLoading, createClient, deleteClient } = useClients()
  const [clientToDeleteId, setClientToDeleteId] = useState<string | null>(null)

  return (
    <div className="space-y-6 text-right animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">إدارة العملاء</h1>
        <BackButton fallbackPath="/dashboard" />
      </div>

      {/* Add Client Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة عميل جديد
        </h2>
        <ClientForm
          submitLabel="✓ حفظ العميل"
          onSubmit={async (values) => {
            await createClient(values as any)
          }}
        />
      </div>

      {/* Clients List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-dark-md">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center justify-between">
          <span>قائمة العملاء</span>
          <span className="text-sm font-normal px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
            {data?.length ?? 0} عميل
          </span>
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400 mr-3">جاري تحميل العملاء...</span>
          </div>
        ) : !(data ?? []).length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 10-22 0v2h2z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">لا يوجد عملاء</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">ابدأ بإضافة عميل جديد باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(data ?? []).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-base">{c.name}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {c.phone && <span className="flex items-center gap-1">📱 {c.phone}</span>}
                    {c.address && <span className="flex items-center gap-1">📍 {c.address}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setClientToDeleteId(c.id)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors whitespace-nowrap"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!clientToDeleteId}
        title="تأكيد حذف العميل"
        description="هل أنت متأكد من حذف هذا العميل؟ لن يتم حذف المشاريع السابقة ولكن لن يظهر هذا العميل في الإضافات الجديدة."
        confirmLabel="نعم، حذف العميل"
        cancelLabel="إلغاء"
        tone="danger"
        onCancel={() => setClientToDeleteId(null)}
        onConfirm={async () => {
          if (!clientToDeleteId) return
          await deleteClient(clientToDeleteId)
          setClientToDeleteId(null)
        }}
      />
    </div>
  )
}
