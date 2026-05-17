'use client'

import Link from 'next/link'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../PageShell'
import { useI18n } from '../LanguageProvider'

const POST_KEYS = [
  { slug: 'certificado-100-horas', date: '2026-05-01', titleKey: 'blog.post1title' as const, excerptKey: 'blog.post1excerpt' as const },
  { slug: 'assinatura-todos-cursos', date: '2026-04-15', titleKey: 'blog.post2title' as const, excerptKey: 'blog.post2excerpt' as const },
  { slug: 'whatsapp-promocoes', date: '2026-04-01', titleKey: 'blog.post3title' as const, excerptKey: 'blog.post3excerpt' as const },
]

export default function BlogView() {
  const { t } = useI18n()

  return (
    <PageShell>
      <h1 className={siteTitleClass}>{t('blog.title')}</h1>
      <p className={`${siteMutedClass} mt-2 max-w-2xl`}>{t('blog.subtitle')}</p>
      <div className="mt-8 space-y-4">
        {POST_KEYS.map((post) => (
          <article key={post.slug} className={`${siteCardClass} p-6`}>
            <time className="text-xs font-medium text-slate-500">{post.date}</time>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{t(post.titleKey)}</h2>
            <p className="mt-2 text-sm text-slate-600">{t(post.excerptKey)}</p>
          </article>
        ))}
      </div>
      <p className="mt-8">
        <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
          ← {t('common.backToHome')}
        </Link>
      </p>
    </PageShell>
  )
}
