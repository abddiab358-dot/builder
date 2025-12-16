import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSmartFund } from '../hooks/useSmartFund'
import { useExpenses } from '../hooks/useExpenses'
import { CurrencyInput } from '../components/smart-fund/CurrencyInput'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { BackButton } from '../components/ui/BackButton'
import { SmartFundTransaction } from '../types/domain'

export function ProjectSmartFundPage() {
    const { id: projectId } = useParams<{ id: string }>()
    const { balance, transactions, addTransaction, deleteTransaction } = useSmartFund(projectId!)
    // For Analysis Tab
    const { data: expenses } = useExpenses(projectId!)

    // UI State
    const [activeTab, setActiveTab] = useState<'fund' | 'analysis'>('fund')
    const [exchangeRate, setExchangeRate] = useState<number>(15000) // Default guess

    // Transaction Form State
    const [amount, setAmount] = useState(0)
    const [currency, setCurrency] = useState<'USD' | 'SYP'>('USD')
    const [label, setLabel] = useState('')
    const [category, setCategory] = useState('')
    const [type, setType] = useState<'deposit' | 'expense'>('deposit')
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount) return

        await addTransaction({
            date: new Date().toISOString(),
            amount,
            currency,
            type,
            label,
            category: type === 'expense' ? (category || 'other') : undefined,
            exchangeRate,
        })

        // Reset Form
        setAmount(0)
        setLabel('')
        setCategory('')
    }

    // --- Analysis Helpers ---
    const expenseCategories = ['materials', 'equipment', 'fuel', 'extra_work', 'food', 'worker_daily', 'other'] as const
    const categoryLabels: Record<string, string> = {
        materials: 'المواد',
        equipment: 'المعدات',
        fuel: 'الوقود',
        extra_work: 'أعمال إضافية',
        food: 'الطعام',
        worker_daily: 'يوميات عمال',
        other: 'أخرى'
    }

    const getCategoryTotal = (cat: string) => {
        return (expenses ?? [])
            .filter(e => e.category === cat)
            .reduce((sum, e) => sum + (e.amount || 0), 0)
    }

    const totalFinanceExpenses = (expenses ?? []).reduce((sum, e) => sum + (e.amount || 0), 0)

    // --- Render ---

    if (!projectId) return null

    return (
        <div className="space-y-6 text-right" dir="rtl">
            {/* Header & Exchange Rate */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">الصندوق الذكي 🏦</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">إدارة صندوق المشروع وتحليل المصاريف</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">سعر الصرف اليوم ($1 = )</label>
                    <input
                        type="number"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-center font-bold text-primary-700 dark:text-primary-400"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">ل.س</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex gap-6">
                    <button
                        onClick={() => setActiveTab('fund')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'fund'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                    >
                        إدارة الصندوق
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis'
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                    >
                        تحليل المصاريف (من المالية)
                    </button>
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'fund' && (
                <div className="space-y-6">
                    {/* Balance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl">
                            <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">الرصيد بالدولار</div>
                            <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-300" dir="ltr">
                                ${balance.usd.toLocaleString()}
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                يعادل: {(balance.usd * exchangeRate).toLocaleString()} ل.س
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
                            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">الرصيد بالليرة السورية</div>
                            <div className="text-3xl font-bold text-blue-800 dark:text-blue-300">
                                {balance.syp.toLocaleString()} ل.س
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                يعادل: {(balance.syp / (exchangeRate || 1)).toLocaleString('en-US', { maximumFractionDigits: 2 })} $
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Transaction Form */}
                        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-fit">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 border-b dark:border-slate-700 pb-2">عملية جديدة</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setType('deposit')}
                                        className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-all ${type === 'deposit' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        📥 إيداع
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('expense')}
                                        className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        📤 مصروف
                                    </button>
                                </div>

                                <CurrencyInput
                                    amount={amount}
                                    currency={currency}
                                    exchangeRate={exchangeRate}
                                    onAmountChange={setAmount}
                                    onCurrencyChange={setCurrency}
                                    label={type === 'deposit' ? 'المبلغ المودع' : 'قيمة المصروف'}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">البيان / الوصف</label>
                                    <input
                                        type="text"
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        placeholder={type === 'deposit' ? 'مثال: دفعة من العميل' : 'مثال: شراء كابلات'}
                                        required
                                    />
                                </div>

                                {type === 'expense' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">نوع المصروف</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        >
                                            <option value="">اختر التصنيف...</option>
                                            <option value="materials">المواد</option>
                                            <option value="equipment">المعدات</option>
                                            <option value="fuel">الوقود</option>
                                            <option value="food">الطعام</option>
                                            <option value="worker_daily">يوميات</option>
                                            <option value="other">أخرى</option>
                                        </select>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!amount}
                                    className={`w-full py-2.5 rounded-lg text-white font-medium shadow-sm transition-colors ${type === 'deposit'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                                        : 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                                        }`}
                                >
                                    {type === 'deposit' ? 'إضافة المبلغ للصندوق' : 'تسجيل مصروف'}
                                </button>
                            </form>
                        </div>

                        {/* Transactions History */}
                        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">سجل الحركات</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">التاريخ</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">العملية</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">المبلغ</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">المعادل</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">خيارات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                                    لا توجد حركات مسجلة في الصندوق بعد
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.map((t) => {
                                                const isDeposit = t.type === 'deposit';
                                                const eqValue = t.currency === 'USD'
                                                    ? t.amount * (t.exchangeRate || exchangeRate)
                                                    : t.amount / (t.exchangeRate || exchangeRate);

                                                return (
                                                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                                            {new Date(t.date).toLocaleDateString('ar-EG')}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <span className={`w-2 h-2 rounded-full mr-2 ${isDeposit ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                                <div>
                                                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.label}</div>
                                                                    {!isDeposit && t.category && <div className="text-xs text-slate-500 dark:text-slate-400">{categoryLabels[t.category] || t.category}</div>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} dir="ltr">
                                                            {isDeposit ? '+' : '-'}{t.amount.toLocaleString()} {t.currency === 'USD' ? '$' : 'ل.س'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400" dir="ltr">
                                                            ~{eqValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} {t.currency === 'USD' ? 'SYP' : '$'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                            <button onClick={() => setDeleteId(t.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                                حذف
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center gap-3">
                        <div className="text-2xl">📊</div>
                        <div>
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                هذه البيانات مجمعة من صفحة "المالية" والمصاريف المسجلة هناك.
                                <br />
                                <span className="text-xs opacity-75">ملاحظة: المبالغ هنا تُعرض كما تم إدخالها (يُفترض أنها بالليرة السورية ما لم يتم تحديد غير ذلك في الملاحظات).</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Card */}
                        <div className="bg-slate-800 text-white p-5 rounded-xl col-span-full md:col-span-1 shadow-lg border border-slate-700">
                            <div className="text-sm text-slate-400 mb-1">إجمالي المصاريف</div>
                            <div className="text-3xl font-bold">{totalFinanceExpenses.toLocaleString()}</div>
                            <div className="text-xs text-slate-400 mt-2">ليرة سورية (تقديري)</div>
                        </div>

                        {/* Categories */}
                        {expenseCategories.map(cat => {
                            const total = getCategoryTotal(cat)
                            if (total === 0) return null
                            return (
                                <div key={cat} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{categoryLabels[cat]}</div>
                                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{total.toLocaleString()}</div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3">
                                        <div
                                            className="bg-primary-500 h-1.5 rounded-full"
                                            style={{ width: `${(total / totalFinanceExpenses) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteId}
                title="حذف العملية"
                description="هل أنت متأكد من حذف هذه العملية؟ سيتم تحديث رصيد الصندوق تلقائياً."
                tone="danger"
                confirmLabel="حذف"
                onCancel={() => setDeleteId(null)}
                onConfirm={async () => {
                    if (deleteId) {
                        await deleteTransaction(deleteId)
                        setDeleteId(null)
                    }
                }}
            />
        </div>
    )
}
