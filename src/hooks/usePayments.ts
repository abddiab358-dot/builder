import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { Payment } from '../types/domain'
import { createId } from '../utils/id'
import { useActivity } from './useActivity'
import { useNotifications } from './useNotifications'

export function usePayments(projectId?: string) {
  const { payments } = useFileSystem()
  const collection = useJsonCollection<Payment>('payments', payments)
  const { log } = useActivity()
  const { notify } = useNotifications()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((p) => (projectId ? p.projectId === projectId : true)),
  }

  const createPayment = async (input: Omit<Payment, 'id' | 'createdAt'>) => {
    const id = createId()
    const now = new Date().toISOString()
    await collection.save((items) => [...items, { ...input, id, createdAt: now }])

    await Promise.all([
      log({ action: 'تسجيل دفعة', entity: 'payment', entityId: id, details: `${input.amount}` }),
      notify({
        type: 'info',
        message: `تم تسجيل دفعة بقيمة ${input.amount.toLocaleString('ar-EG')} للمشروع`,
        projectId: input.projectId,
        entity: 'payment',
        entityId: id,
        dueDate: input.date,
      }),
    ])
  }

  const deletePayment = async (id: string) => {
    await collection.save((items) => items.filter((p) => p.id !== id))
    log({ action: 'حذف دفعة', entity: 'payment', entityId: id }).catch(() => {})
  }

  return {
    ...filtered,
    createPayment,
    deletePayment,
  }
}
