import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGlobalSearch, type SearchResult } from '../../hooks/useGlobalSearch'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const results = useGlobalSearch(query)

  // إغلاق البحث عند النقر خارجه
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // اختصار لوحة المفاتيح Ctrl+K أو Cmd+K
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('global-search')?.focus()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      project: 'مشروع',
      task: 'مهمة',
      client: 'عميل',
      worker: 'عامل',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
      case 'task':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'client':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'worker':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <input
          id="global-search"
          type="text"
          placeholder="بحث... (Ctrl+K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
        />
        <svg
          className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm">ابدأ الكتابة للبحث عن المشاريع والمهام والعملاء والعمال</p>
              <p className="text-xs mt-2 text-slate-400 dark:text-slate-500">
                استخدم Ctrl+K لفتح البحث من أي مكان
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm">لا توجد نتائج تطابق "{query}"</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.link}
                  onClick={() => {
                    setQuery('')
                    setIsOpen(false)
                  }}
                  className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start gap-3 text-right">
                    <span className="text-xl">{result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {result.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${getTypeColor(result.type)}`}>
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">{result.subtitle}</p>
                      )}
                      {result.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-1">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
