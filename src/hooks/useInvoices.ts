import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { Invoice, InvoiceItem } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'
import { useNotifications } from './useNotifications'

export function useInvoices(projectId?: string) {
  const { invoices } = useFileSystem()
  const collection = useJsonCollection<Invoice>('invoices', invoices)
  const { log } = useActivity()
  const { notify } = useNotifications()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((inv) => (projectId ? inv.projectId === projectId : true)),
  }

  const calculateTotals = (items: InvoiceItem[], taxRate?: number) => {
    const subtotal = items.reduce((sum, it) => sum + it.total, 0)
    const taxAmount = taxRate ? (subtotal * taxRate) / 100 : 0
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }

  const createInvoice = async (
    input: Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'taxAmount' | 'total' | 'paidAmount'>,
  ) => {
    const id = createId()
    const now = new Date().toISOString()
    const { subtotal, taxAmount, total } = calculateTotals(input.items, input.taxRate)
    await collection.save((items) => [
      ...items,
      {
        ...input,
        id,
        createdAt: now,
        subtotal,
        taxAmount,
        total,
        paidAmount: 0,
      },
    ])
    await log({ action: 'إنشاء فاتورة', entity: 'invoice', entityId: id, details: input.number })

    if (input.dueDate) {
      await notify({
        type: 'payment_due',
        message: `فاتورة رقم ${input.number} تستحق في ${new Date(input.dueDate).toLocaleDateString('ar-EG')}`,
        projectId: input.projectId,
        entity: 'invoice',
        entityId: id,
        dueDate: input.dueDate,
      })
    }
  }

  const updateInvoice = async (id: string, patch: Partial<Invoice>) => {
    await collection.save((items) => {
      const idx = items.findIndex((inv) => inv.id === id)
      if (idx === -1) return items
      const next = [...items]
      const merged: Invoice = { ...next[idx], ...patch }
      if (patch.items || patch.taxRate != null) {
        const { subtotal, taxAmount, total } = calculateTotals(merged.items, merged.taxRate)
        merged.subtotal = subtotal
        merged.taxAmount = taxAmount
        merged.total = total
      }
      next[idx] = merged
      return next
    })
    await log({ action: 'تحديث فاتورة', entity: 'invoice', entityId: id })
  }

  const deleteInvoice = async (id: string) => {
    await collection.save((items) => items.filter((inv) => inv.id !== id))
    await log({ action: 'حذف فاتورة', entity: 'invoice', entityId: id })
  }

  return {
    ...filtered,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  }
}
