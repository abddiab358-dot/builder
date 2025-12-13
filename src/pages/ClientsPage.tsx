import { useState } from 'react'
import { useClients } from '../hooks/useClients'
import { ClientForm } from '../components/clients/ClientForm'
import { BackButton } from '../components/ui/BackButton'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function ClientsPage() {
  const { data, isLoading, createClient, deleteClient } = useClients()
  const [clientToDeleteId, setClientToDeleteId] = useState<string | null>(null)

  return (
    <div className="space-y-4 text-right">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">العملاء</h2>
        <BackButton fallbackPath="/dashboard" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">إضافة عميل جديد</h3>
        <ClientForm
          submitLabel="حفظ العميل"
          onSubmit={async (values) => {
            await createClient(values as any)
          }}
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">قائمة العملاء</h3>
        {isLoading && <div className="text-xs text-slate-500">جاري تحميل العملاء...</div>}
        {!isLoading && !(data ?? []).length && (
          <div className="text-xs text-slate-500">لا يوجد عملاء بعد.</div>
        )}
        <div className="space-y-2">
          {(data ?? []).map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 border-b last:border-b-0 border-slate-100 py-1.5"
            >
              <div>
                <div className="text-sm font-medium text-slate-900">{c.name}</div>
                <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                  {c.phone && <span>هاتف: {c.phone}</span>}
                  {c.address && <span>عنوان: {c.address}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClientToDeleteId(c.id)}
                className="px-2 py-1 rounded-md text-[11px] bg-red-50 text-red-600 hover:bg-red-100"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      </div>
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
