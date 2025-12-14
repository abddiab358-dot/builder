import React from 'react'

interface Props {
    amount: number
    currency: 'USD' | 'SYP'
    exchangeRate: number
    onAmountChange: (val: number) => void
    onCurrencyChange: (curr: 'USD' | 'SYP') => void
    label?: string
    placeholder?: string
}

export function CurrencyInput({
    amount,
    currency,
    exchangeRate,
    onAmountChange,
    onCurrencyChange,
    label = 'المبلغ',
    placeholder = '0.00'
}: Props) {

    const convertedValue = currency === 'USD'
        ? amount * exchangeRate
        : (exchangeRate > 0 ? amount / exchangeRate : 0)

    const convertedLabel = currency === 'USD'
        ? `${convertedValue.toLocaleString('ar-EG')} ليرة سورية`
        : `${convertedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} دولار`

    return (
        <div className="space-y-1 text-right">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            <div className="relative flex rounded-md shadow-sm">
                <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-none rounded-r-md border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder={placeholder}
                />
                <div className="flex border border-l border-y border-slate-300 dark:border-slate-700 rounded-l-md bg-slate-50 dark:bg-slate-800">
                    <button
                        type="button"
                        onClick={() => onCurrencyChange('USD')}
                        className={`px-3 py-2 text-sm font-medium border-l border-slate-300 dark:border-slate-700 transition-colors ${currency === 'USD'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        $
                    </button>
                    <button
                        type="button"
                        onClick={() => onCurrencyChange('SYP')}
                        className={`px-3 py-2 text-sm font-medium transition-colors rounded-l-md ${currency === 'SYP'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        ل.س
                    </button>
                </div>
            </div>
            {amount > 0 && exchangeRate > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    يعادل تقريباً: <span className="font-semibold text-slate-700 dark:text-slate-300">{convertedLabel}</span> (على سعر صرف {exchangeRate})
                </div>
            )}
        </div>
    )
}
