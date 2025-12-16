import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectWorks } from '../hooks/useProjectWorks'
import { BackButton } from '../components/ui/BackButton'

export function ProjectWorksPage() {
    const { id } = useParams<{ id: string }>()
    const { data: works, createWork, toggleWork, deleteWork } = useProjectWorks(id)

    const [newWorkTitle, setNewWorkTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAddWork = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newWorkTitle.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            await createWork(newWorkTitle.trim())
            setNewWorkTitle('')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!id) return null

    const sortedWorks = [...(works ?? [])].sort((a, b) => {
        // Incomplete first, then by creation date
        if (a.isCompleted === b.isCompleted) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return a.isCompleted ? 1 : -1
    })

    // Calculate progress
    const totalWorks = works?.length || 0
    const completedWorks = works?.filter(w => w.isCompleted).length || 0
    const progress = totalWorks === 0 ? 0 : Math.round((completedWorks / totalWorks) * 100)

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">أعمال المشروع</h1>
                        <p className="text-slate-500 dark:text-slate-400">قائمة بالأعمال المنجزة والمراد إنجازها</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">الإنجاز:</span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <form onSubmit={handleAddWork} className="flex gap-2">
                    <button
                        type="submit"
                        disabled={!newWorkTitle.trim() || isSubmitting}
                        className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    <input
                        type="text"
                        value={newWorkTitle}
                        onChange={(e) => setNewWorkTitle(e.target.value)}
                        placeholder="أضف عملاً جديداً..."
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500 px-4 text-right"
                    />
                </form>
            </div>

            <div className="space-y-2">
                {sortedWorks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>لا توجد أعمال مضافة بعد</p>
                    </div>
                ) : (
                    sortedWorks.map((work) => (
                        <div
                            key={work.id}
                            className={`group flex items-center justify-between p-4 rounded-lg border transition-all ${work.isCompleted
                                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <button
                                    onClick={() => toggleWork(work.id, !work.isCompleted)}
                                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${work.isCompleted
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-slate-400 dark:border-slate-500 text-transparent hover:border-primary-500'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <div className={`flex-1 text-right ${work.isCompleted ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {work.title}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {work.completedAt && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 0 002-2V7a2 0 00-2-2H5a2 0 00-2 2v12a2 0 002 2z" /></svg>
                                        {new Date(work.completedAt).toLocaleDateString('ar-SY')}
                                    </span>
                                )}
                                <button
                                    onClick={() => deleteWork(work.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 0 0116.138 21H7.862a2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
