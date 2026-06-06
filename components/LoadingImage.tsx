const sizeMap = {
  xs: 'h-4 w-4 border-2',
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-[3px]',
  lg: 'h-14 w-14 border-[3px]',
} as const

const colorMap = {
  default: 'border-slate-200 border-t-blue-600',
  white: 'border-white/30 border-t-white',
} as const

type LoadingImageProps = {
  size?: keyof typeof sizeMap
  color?: keyof typeof colorMap
  className?: string
  label?: string
  inline?: boolean
}

export function LoadingSpinner({
  size = 'md',
  color = 'default',
  className = '',
}: Pick<LoadingImageProps, 'size' | 'color' | 'className'>) {
  return (
    <div
      className={`${sizeMap[size]} animate-spin rounded-full ${colorMap[color]} ${className}`}
      aria-hidden
    />
  )
}

export default function LoadingImage({
  size = 'md',
  color = 'default',
  className = '',
  label = 'Loading…',
  inline = false,
}: LoadingImageProps) {
  const spinner = <LoadingSpinner size={size} color={color} />

  if (inline) {
    return (
      <>
        {spinner}
        <span className="sr-only">{label}</span>
      </>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex items-center justify-center ${className}`}
    >
      {spinner}
      <span className="sr-only">{label}</span>
    </div>
  )
}
