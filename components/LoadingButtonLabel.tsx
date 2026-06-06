import type { ReactNode } from 'react'
import LoadingImage from './LoadingImage'

type LoadingButtonLabelProps = {
  loading: boolean
  label?: string
  color?: 'default' | 'white'
  children: ReactNode
}

export default function LoadingButtonLabel({
  loading,
  label = 'Loading…',
  color = 'white',
  children,
}: LoadingButtonLabelProps) {
  if (loading) {
    return <LoadingImage inline size="xs" color={color} label={label} />
  }

  return <>{children}</>
}
