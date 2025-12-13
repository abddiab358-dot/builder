import { useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'

export function ThemeManager() {
  const { data: settings } = useSettings()

  useEffect(() => {
    const root = document.documentElement
    if (settings?.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [settings?.theme])

  return null
}
