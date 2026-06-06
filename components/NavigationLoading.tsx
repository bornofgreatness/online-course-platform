'use client'

import { Suspense, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import LoadingImage from './LoadingImage'

function NavigationLoadingInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const currentRoute = `${pathname}?${searchParams.toString()}`

  useEffect(() => {
    setLoading(false)
  }, [currentRoute])

  useEffect(() => {
    const showForHref = (href: string | null) => {
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return
      }

      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return

        const targetRoute = `${url.pathname}${url.search}`
        const current = `${pathname}${window.location.search}`
        if (targetRoute === current) return

        setLoading(true)
      } catch {
        // Ignore invalid href values.
      }
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a')
      if (!anchor) return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return

      showForHref(anchor.getAttribute('href'))
    }

    const onPopState = () => setLoading(true)

    const showForUrl = (nextUrl: string | URL | null | undefined) => {
      if (!nextUrl) return

      try {
        const resolved = new URL(String(nextUrl), window.location.href)
        if (resolved.origin !== window.location.origin) return

        const targetRoute = `${resolved.pathname}${resolved.search}`
        const current = `${window.location.pathname}${window.location.search}`
        if (targetRoute === current) return

        setLoading(true)
      } catch {
        setLoading(true)
      }
    }

    const originalPushState = history.pushState.bind(history)
    const originalReplaceState = history.replaceState.bind(history)

    history.pushState = (state, unused, url) => {
      showForUrl(url)
      return originalPushState(state, unused, url)
    }

    history.replaceState = (state, unused, url) => {
      showForUrl(url)
      return originalReplaceState(state, unused, url)
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)

    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-100/80 backdrop-blur-[1px]"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingImage size="lg" />
    </div>
  )
}

export default function NavigationLoading() {
  return (
    <Suspense fallback={null}>
      <NavigationLoadingInner />
    </Suspense>
  )
}
