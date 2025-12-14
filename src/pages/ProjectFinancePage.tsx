import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useInvoices } from '../hooks/useInvoices'
import { usePayments } from '../hooks/usePayments'
import { useExpenses } from '../hooks/useExpenses'
import { useProjectFiles } from '../hooks/useProjectFiles'
import { useWorkers } from '../hooks/useWorkers'
import { Modal } from '../components/ui/Modal'
import { BackButton } from '../components/ui/BackButton'
import { InvoiceItem, ExpenseCategory } from '../types/domain'
import { createId } from '../utils/id'

export function ProjectFinancePage() {
  const { id } = useParams<{ id: string }>()
  const { data: projects } = useProjects()
  const invoicesState = useInvoices(id)
  const paymentsState = usePayments(id)
  const expensesState = useExpenses(id)
  const filesState = useProjectFiles(id)
  const workersState = useWorkers(id)

  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'expenses' | 'workersLog'>('invoices')

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [invoiceDueDate, setInvoiceDueDate] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [invoiceImageFileId, setInvoiceImageFileId] = useState('')
  const [invoiceDescription, setInvoiceDescription] = useState('')

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentInvoiceId, setPaymentInvoiceId] = useState('')
  const [paymentWorkerId, setPaymentWorkerId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('materials')
  const [expenseLabel, setExpenseLabel] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [expenseWorkerId, setExpenseWorkerId] = useState('')
  const [expenseDailyRate, setExpenseDailyRate] = useState('')

  const [workerLogModalOpen, setWorkerLogModalOpen] = useState(false)
  const [logDate, setLogDate] = useState('')
  const [logWorkerId, setLogWorkerId] = useState('')
  const [logWorkersCount, setLogWorkersCount] = useState('1')

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ type: 'invoice' | 'payment' | 'expense', id: string } | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{ type: 'invoice' | 'payment' | 'expense', id: string, data: any } | null>(null)

  if (!id) return null

  const project = (projects ?? []).find((p) => p.id === id)

  const invoices = invoicesState.data ?? []
  const payments = paymentsState.data ?? []
  const expenses = expensesState.data ?? []
  const workerLogs = expenses.filter((e) => e.category === 'worker_daily')

  const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const totalLabor = workerLogs.reduce((sum, e) => sum + (e.amount || 0), 0)
  const remaining = totalInvoices - totalPayments

  const handleCreateInvoice = async () => {
    if (!invoiceNumber.trim() || !invoiceDate || !invoiceAmount) return
    const baseAmount = Number(invoiceAmount)
    if (!baseAmount || Number.isNaN(baseAmount)) return

    try {
      const item: InvoiceItem = {
        id: createId(),
        description: invoiceDescription.trim() || 'بنود الفاتورة',
        quantity: 1,
        unitPrice: baseAmount,
        total: baseAmount,
      }

      await invoicesState.createInvoice({
        projectId: id,
        number: invoiceNumber.trim(),
        date: invoiceDate,
        dueDate: invoiceDueDate || undefined,
        items: [item],
        taxRate: undefined,
        notes: invoiceDescription.trim() || undefined,
        logoFileId: undefined,
        imageFileId: invoiceImageFileId || undefined,
      } as any)

      setInvoiceNumber('')
      setInvoiceDate('')
      setInvoiceDueDate('')
      setInvoiceAmount('')
      setInvoiceImageFileId('')
      setInvoiceDescription('')
      setInvoiceModalOpen(false)
    } catch (error) {
      console.error('خطأ في إنشاء الفاتورة:', error)
    }
  }

  const handleCreatePayment = async () => {
    if (!paymentDate || !paymentAmount) return
    const amount = Number(paymentAmount)
    if (!amount || Number.isNaN(amount)) return

    try {
      await paymentsState.createPayment({
        projectId: id,
        invoiceId: paymentInvoiceId || undefined,
        workerId: paymentWorkerId || undefined,
        date: paymentDate,
        amount,
        method: paymentMethod || undefined,
        notes: undefined,
      } as any)

      setPaymentDate('')
      setPaymentAmount('')
      setPaymentInvoiceId('')
      setPaymentWorkerId('')
      setPaymentMethod('')
      setPaymentModalOpen(false)
    } catch (error) {
      console.error('خطأ في إنشاء الدفعة:', error)
    }
  }

  const handleCreateExpense = async () => {
    if (!expenseLabel.trim() || !expenseDate || !expenseAmount) return
    const amount = Number(expenseAmount)
    if (!amount || Number.isNaN(amount)) return

    try {
      await expensesState.createExpense({
        projectId: id,
        category: expenseCategory,
        label: expenseLabel.trim(),
        amount,
        date: expenseDate,
        workerId: expenseWorkerId || undefined,
        dailyRate: expenseDailyRate ? Number(expenseDailyRate) : undefined,
        notes: undefined,
      } as any)

      setExpenseLabel('')
      setExpenseAmount('')
      setExpenseDate('')
      setExpenseCategory('materials')
      setExpenseWorkerId('')
      setExpenseDailyRate('')
      setExpenseModalOpen(false)
    } catch (error) {
      console.error('خطأ في إنشاء المصروف:', error)
    }
  }

  const handleCreateWorkerLog = async () => {
    if (!logDate || !logWorkerId || !logWorkersCount) return
    const workersCount = Number(logWorkersCount)
    if (!workersCount || Number.isNaN(workersCount)) return

    try {
      const selectedWorker = (workersState.data ?? []).find((w) => w.id === logWorkerId)
      if (!selectedWorker) return

      await expensesState.createExpense({
        projectId: id,
        category: 'worker_daily',
        label: selectedWorker.name,
        amount: (selectedWorker.dailyRate || 0) * workersCount,
        date: logDate,
        workerId: logWorkerId,
        dailyRate: selectedWorker.dailyRate,
        notes: `عدد العمال: ${workersCount}`,
      } as any)

      setLogDate('')
      setLogWorkerId('')
      setLogWorkersCount('1')
      setWorkerLogModalOpen(false)
    } catch (error) {
      console.error('خطأ في إنشاء يومية العمال:', error)
    }
  }

  const handleDeleteItem = async () => {
    if (!deleteItem) return
    try {
      if (deleteItem.type === 'invoice') {
        await invoicesState.deleteInvoice(deleteItem.id)
      } else if (deleteItem.type === 'payment') {
        await paymentsState.deletePayment(deleteItem.id)
      } else if (deleteItem.type === 'expense') {
        await expensesState.deleteExpense(deleteItem.id)
      }
      setDeleteItem(null)
      setDeleteConfirmOpen(false)
    } catch (error) {
      console.error('خطأ في حذف العنصر:', error)
    }
  }

  const openDeleteConfirm = (type: 'invoice' | 'payment' | 'expense', id: string) => {
    setDeleteItem({ type, id })
    setDeleteConfirmOpen(true)
  }

  const openEditModal = (type: 'invoice' | 'payment' | 'expense', id: string) => {
    let data = null
    if (type === 'invoice') {
      data = invoices.find((inv) => inv.id === id)
    } else if (type === 'payment') {
      data = payments.find((p) => p.id === id)
    } else if (type === 'expense') {
      data = expenses.find((e) => e.id === id)
    }
    if (!data) return
    setEditingItem({ type, id, data })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return
    try {
      if (editingItem.type === 'invoice') {
        // تحديث الفاتورة
        await invoicesState.updateInvoice(editingItem.id, editingItem.data)
      } else if (editingItem.type === 'payment') {
        // تحديث الدفعة - نحتاج للتحقق من وجود updatePayment
        const paymentHooks = paymentsState as any
        if (paymentHooks.updatePayment) {
          await paymentHooks.updatePayment(editingItem.id, editingItem.data)
        } else {
          // إذا لم تكن موجودة، سيكون لدينا خطأ
          console.warn('updatePayment not available, deleting and recreating')
          await paymentsState.deletePayment(editingItem.id)
          await paymentsState.createPayment({
            ...editingItem.data,
            projectId: id,
          } as any)
        }
      } else if (editingItem.type === 'expense') {
        // تحديث المصروف
        const expenseHooks = expensesState as any
        if (expenseHooks.updateExpense) {
          await expenseHooks.updateExpense(editingItem.id, editingItem.data)
        } else {
          console.warn('updateExpense not available, deleting and recreating')
          await expensesState.deleteExpense(editingItem.id)
          await expensesState.createExpense({
            ...editingItem.data,
            projectId: id,
          } as any)
        }
      }
      setEditModalOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('خطأ في تحديث العنصر:', error)
    }
  }

  return (
    <div className="space-y-4 text-right">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">المالية والتكاليف للمشروع</h2>
          {project && <p className="text-xs text-slate-600">{project.title}</p>}
        </div>
        <BackButton fallbackPath={`/projects/${id}`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs flex flex-col gap-1">
          <div className="text-slate-500 dark:text-slate-400">إجمالي الفواتير</div>
          <div className="text-base font-semibold text-slate-900 dark:text-slate-50">{totalInvoices.toLocaleString('ar-EG')} ليرة سورية</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs flex flex-col gap-1">
          <div className="text-slate-500 dark:text-slate-400">إجمالي الدفعات المستلمة</div>
          <div className="text-base font-semibold text-emerald-700 dark:text-emerald-400">{totalPayments.toLocaleString('ar-EG')} ليرة سورية</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs flex flex-col gap-1">
          <div className="text-slate-500 dark:text-slate-400">المتبقي على العميل</div>
          <div className="text-base font-semibold text-amber-700 dark:text-amber-400">{remaining.toLocaleString('ar-EG')} ليرة سورية</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs flex flex-col gap-1">
          <div className="text-slate-500 dark:text-slate-400">إجمالي التكاليف (مصاريف + عمال)</div>
          <div className="text-base font-semibold text-slate-900 dark:text-slate-50">
            {(totalExpenses + totalLabor).toLocaleString('ar-EG')} ليرة سورية
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="border-b border-slate-200 dark:border-slate-700 flex text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 px-3 py-2 text-center ${
              activeTab === 'invoices'
                ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            الفواتير
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex-1 px-3 py-2 text-center ${
              activeTab === 'payments'
                ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            الدفعات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 px-3 py-2 text-center ${
              activeTab === 'expenses'
                ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            المصاريف
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workersLog')}
            className={`flex-1 px-3 py-2 text-center ${
              activeTab === 'workersLog'
                ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            يوميات العمال
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs text-slate-700 dark:text-slate-300">
          {activeTab === 'invoices' && (
            <>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">الفواتير</div>
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(true)}
                  className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
                >
                  فاتورة جديدة
                </button>
              </div>
              {invoices.length === 0 && <div>لا توجد فواتير مسجلة بعد.</div>}
              {invoices.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-right">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="px-2 py-1 font-medium">رقم الفاتورة</th>
                        <th className="px-2 py-1 font-medium">التاريخ</th>
                        <th className="px-2 py-1 font-medium">الاستحقاق</th>
                        <th className="px-2 py-1 font-medium">الإجمالي</th>
                        <th className="px-2 py-1 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="px-2 py-1">{inv.number}</td>
                          <td className="px-2 py-1">
                            {inv.date && new Date(inv.date).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-2 py-1">
                            {inv.dueDate && new Date(inv.dueDate).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-2 py-1">
                            {inv.total.toLocaleString('ar-EG')} ليرة سورية
                          </td>
                          <td className="px-2 py-1 flex gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => openEditModal('invoice', inv.id)}
                              className="px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteConfirm('invoice', inv.id)}
                              className="px-2 py-1 rounded-md text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">دفعات العملاء</div>
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(true)}
                  className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
                >
                  تسجيل دفعة
                </button>
              </div>
              {payments.length === 0 && <div>لا توجد دفعات مسجلة بعد.</div>}
              {payments.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-right">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="px-2 py-1 font-medium">التاريخ</th>
                        <th className="px-2 py-1 font-medium">المبلغ</th>
                        <th className="px-2 py-1 font-medium">طريقة الدفع</th>
                        <th className="px-2 py-1 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="px-2 py-1">
                            {p.date && new Date(p.date).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-2 py-1">{p.amount.toLocaleString('ar-EG')} ليرة سورية</td>
                          <td className="px-2 py-1">{p.method || '-'}</td>
                          <td className="px-2 py-1 flex gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => openEditModal('payment', p.id)}
                              className="px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteConfirm('payment', p.id)}
                              className="px-2 py-1 rounded-md text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'expenses' && (
            <>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">مصاريف المشروع</div>
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(true)}
                  className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
                >
                  إضافة مصروف
                </button>
              </div>
              {expenses.length === 0 && <div>لا توجد مصاريف مسجلة بعد.</div>}
              {expenses.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-right">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="px-2 py-1 font-medium">التاريخ</th>
                        <th className="px-2 py-1 font-medium">الوصف</th>
                        <th className="px-2 py-1 font-medium">النوع</th>
                        <th className="px-2 py-1 font-medium">المبلغ</th>
                        <th className="px-2 py-1 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((e) => (
                        <tr key={e.id} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="px-2 py-1">
                            {e.date && new Date(e.date).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-2 py-1">{e.label}</td>
                          <td className="px-2 py-1">
                            {e.category === 'materials' && 'مواد'}
                            {e.category === 'equipment' && 'معدات'}
                            {e.category === 'fuel' && 'محروقات'}
                            {e.category === 'extra_work' && 'أعمال إضافية'}
                            {e.category === 'food' && 'طعام'}
                            {e.category === 'worker_daily' && 'يومية عمال'}
                            {e.category === 'other' && 'أخرى'}
                          </td>
                          <td className="px-2 py-1">{e.amount.toLocaleString('ar-EG')} ليرة سورية</td>
                          <td className="px-2 py-1 flex gap-1 justify-end">
                            <button
                              type="button"
                              onClick={() => openEditModal('expense', e.id)}
                              className="px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteConfirm('expense', e.id)}
                              className="px-2 py-1 rounded-md text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'workersLog' && (
            <>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">سجل يوميات العمال</div>
                <button
                  type="button"
                  onClick={() => setWorkerLogModalOpen(true)}
                  className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
                >
                  تسجيل يومية عامل
                </button>
              </div>
              {workerLogs.length === 0 && <div>لا توجد سجلات يومية حتى الآن.</div>}
              {workerLogs.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-right">
                    <thead className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="px-2 py-1 font-medium">التاريخ</th>
                        <th className="px-2 py-1 font-medium">اسم العامل</th>
                        <th className="px-2 py-1 font-medium">عدد العمال</th>
                        <th className="px-2 py-1 font-medium">يومية الواحد</th>
                        <th className="px-2 py-1 font-medium">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workerLogs.map((e) => (
                        <tr key={e.id} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="px-2 py-1">
                            {e.date && new Date(e.date).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-2 py-1">{e.label}</td>
                          <td className="px-2 py-1">{e.notes ? e.notes.split(': ')[1] : '-'}</td>
                          <td className="px-2 py-1">{e.dailyRate?.toLocaleString('ar-EG') || '-'} ليرة سورية</td>
                          <td className="px-2 py-1">{e.amount.toLocaleString('ar-EG')} ليرة سورية</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="إنشاء فاتورة جديدة"
        footer={
          <div className="flex justify-between w-full">
            <button
              type="button"
              onClick={() => setInvoiceModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleCreateInvoice}
              className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
            >
              حفظ الفاتورة
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">رقم الفاتورة</label>
              <input
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">تاريخ الفاتورة</label>
              <input
                type="date"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">تاريخ الاستحقاق (اختياري)</label>
              <input
                type="date"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={invoiceDueDate}
                onChange={(e) => setInvoiceDueDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">قيمة الفاتورة</label>
              <input
                type="number"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">صورة الفاتورة (اختياري)</label>
            <input
              type="file"
              accept="image/*"
              className="border rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  try {
                    await filesState.addFiles([file], id)
                    const uploadedFiles = filesState.data?.filter((f) => f.mimeType.startsWith('image/'))
                    if (uploadedFiles && uploadedFiles.length > 0) {
                      setInvoiceImageFileId(uploadedFiles[uploadedFiles.length - 1].id)
                    }
                  } catch (error) {
                    console.error('خطأ في رفع الصورة:', error)
                  }
                }
              }}
            />
            {invoiceImageFileId && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400">✓ تم اختيار الصورة</div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">وصف البنود / ملاحظات</label>
            <textarea
              rows={3}
              className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={invoiceDescription}
              onChange={(e) => setInvoiceDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="تسجيل دفعة جديدة"
        footer={
          <div className="flex justify-between w-full">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleCreatePayment}
              className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
            >
              حفظ الدفعة
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">التاريخ</label>
              <input
                type="date"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">المبلغ</label>
              <input
                type="number"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">ربط الدفعة بفاتورة (اختياري)</label>
            <select
              className="border rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={paymentInvoiceId}
              onChange={(e) => setPaymentInvoiceId(e.target.value)}
            >
              <option value="">بدون</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.number}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">ربط الدفعة بعامل (اختياري)</label>
            <select
              className="border rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={paymentWorkerId}
              onChange={(e) => setPaymentWorkerId(e.target.value)}
            >
              <option value="">بدون</option>
              {(workersState.data ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} - {w.dailyRate || 0} ليرة سورية/يوم
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">طريقة الدفع (اختياري)</label>
            <input
              className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="نقدي، تحويل بنكي، شيك..."
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="إضافة مصروف جديد"
        footer={
          <div className="flex justify-between w-full">
            <button
              type="button"
              onClick={() => setExpenseModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleCreateExpense}
              className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
            >
              حفظ المصروف
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">التاريخ</label>
              <input
                type="date"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">المبلغ</label>
              <input
                type="number"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">الوصف</label>
            <input
              className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={expenseLabel}
              onChange={(e) => setExpenseLabel(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-600">النوع</label>
            <select
              className="border rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
            >
              <option value="materials">مواد</option>
              <option value="equipment">معدات</option>
              <option value="fuel">محروقات</option>
              <option value="extra_work">أعمال إضافية</option>
              <option value="food">طعام</option>
              <option value="worker_daily">يومية عمال</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          {expenseCategory === 'worker_daily' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">اختر العامل</label>
                <select
                  className="border rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={expenseWorkerId}
                  onChange={(e) => {
                    setExpenseWorkerId(e.target.value)
                    const worker = (workersState.data ?? []).find((w) => w.id === e.target.value)
                    if (worker) {
                      setExpenseLabel(worker.name)
                      setExpenseDailyRate((worker.dailyRate || 0).toString())
                      setExpenseAmount((worker.dailyRate || 0).toString())
                    }
                  }}
                >
                  <option value="">اختر عاملاً</option>
                  {(workersState.data ?? []).map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} - {w.dailyRate || 0} ليرة سورية/يوم
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        open={workerLogModalOpen}
        onClose={() => setWorkerLogModalOpen(false)}
        title="تسجيل يومية عامل"
        footer={
          <div className="flex justify-between w-full">
            <button
              type="button"
              onClick={() => setWorkerLogModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleCreateWorkerLog}
              className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
            >
              حفظ السجل
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">التاريخ</label>
              <input
                type="date"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">اختر العامل</label>
              <select
                className="border rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={logWorkerId}
                onChange={(e) => setLogWorkerId(e.target.value)}
              >
                <option value="">اختر عاملاً</option>
                {(workersState.data ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} - {w.dailyRate || 0} ليرة سورية/يوم
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">عدد العمال</label>
              <input
                type="number"
                min="1"
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={logWorkersCount}
                onChange={(e) => setLogWorkersCount(e.target.value)}
              />
            </div>
          </div>
          {logWorkerId && (
            <div className="bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 rounded-md p-3 text-xs">
              <div className="text-primary-900 dark:text-primary-100">
                <div>العامل: <span className="font-semibold">{(workersState.data ?? []).find((w) => w.id === logWorkerId)?.name}</span></div>
                <div>يومية واحدة: <span className="font-semibold">{(workersState.data ?? []).find((w) => w.id === logWorkerId)?.dailyRate || 0} ليرة سورية</span></div>
                <div>الإجمالي: <span className="font-semibold">{((workersState.data ?? []).find((w) => w.id === logWorkerId)?.dailyRate || 0) * Number(logWorkersCount || 0)} ليرة سورية</span></div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingItem(null)
        }}
        title="تعديل البيانات"
        footer={
          <div className="flex justify-between w-full">
            <button
              type="button"
              onClick={() => {
                setEditModalOpen(false)
                setEditingItem(null)
              }}
              className="px-3 py-1.5 rounded-md text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700"
            >
              حفظ التعديلات
            </button>
          </div>
        }
      >
        {editingItem && editingItem.type === 'invoice' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">رقم الفاتورة</label>
                <input
                  className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingItem.data.number || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, number: e.target.value } })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">تاريخ الفاتورة</label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingItem.data.date || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, date: e.target.value } })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">تاريخ الاستحقاق</label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingItem.data.dueDate || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, dueDate: e.target.value } })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">الإجمالي</label>
                <input
                  type="number"
                  className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingItem.data.total || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, total: Number(e.target.value) } })}
                />
              </div>
            </div>
          </div>
        )}
        {editingItem && editingItem.type === 'payment' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">التاريخ</label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingItem.data.date || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, date: e.target.value } })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">المبلغ</label>
                <input
                  type="number"
                  className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingItem.data.amount || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, amount: Number(e.target.value) } })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">طريقة الدفع</label>
              <input
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={editingItem.data.method || ''}
                onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, method: e.target.value } })}
              />
            </div>
          </div>
        )}
        {editingItem && editingItem.type === 'expense' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">التاريخ</label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingItem.data.date || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, date: e.target.value } })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">المبلغ</label>
                <input
                  type="number"
                  className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={editingItem.data.amount || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, amount: Number(e.target.value) } })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600">الوصف</label>
              <input
                className="border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={editingItem.data.label || ''}
                onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, label: e.target.value } })}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setDeleteItem(null)
        }}
        title="تأكيد الحذف"
        footer={
          <div className="flex justify-between w-full">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setDeleteItem(null)
              }}
              className="px-3 py-1.5 rounded-md text-xs border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleDeleteItem}
              className="px-3 py-1.5 rounded-md text-xs bg-red-600 text-white hover:bg-red-700"
            >
              حذف نهائياً
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 dark:text-slate-300">هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.</p>
        </div>
      </Modal>
    </div>
  )
}
