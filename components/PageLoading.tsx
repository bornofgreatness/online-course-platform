import Header from './Header'
import PageShell from './PageShell'
import LoadingImage from './LoadingImage'

type PageLoadingProps = {
  centered?: boolean
  withHeader?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export default function PageLoading({
  centered = false,
  withHeader = true,
  size = 'lg',
  className = '',
  label,
}: PageLoadingProps) {
  const loading = (
    <LoadingImage
      size={size}
      label={label}
      className={centered ? `min-h-[40vh] ${className}` : `py-16 ${className}`}
    />
  )

  if (!withHeader) {
    return loading
  }

  return (
    <>
      <Header />
      <PageShell centered={centered}>{loading}</PageShell>
    </>
  )
}
