const sizeMap = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-[3px]',
  lg: 'h-14 w-14 border-[3px]',
} as const

type LoadingImageProps = {
  size?: keyof typeof sizeMap
  className?: string
  label?: string
}

export default function LoadingImage({
  size = 'md',
  className = '',
  label = 'Loading…',
}: LoadingImageProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex items-center justify-center ${className}`}
    >
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-slate-200 border-t-blue-600`}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
