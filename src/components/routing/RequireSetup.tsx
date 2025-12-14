import React from 'react'

interface Props {
  children: React.ReactNode
}

export function RequireSetup({ children }: Props) {
  // Setup is no longer required - using local storage by default
  return <>{children}</>
}
