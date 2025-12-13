import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  fallbackPath?: string
}

export function BackButton({ fallbackPath = '/dashboard' }: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallbackPath)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
    >
      ← رجوع
    </button>
  )
}
