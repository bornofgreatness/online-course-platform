import Link from 'next/link'
import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'

export const metadata = {
  title: 'Blog',
  description: 'Artigos sobre educação, tecnologia, carreira e desenvolvimento profissional.',
}

const posts = [
  {
    slug: 'certificado-100-horas',
    title: 'Como funciona o certificado de 100 horas',
    excerpt: 'Entenda a carga horária, verificação online e download em PDF do seu certificado.',
    date: '2026-05-01',
  },
  {
    slug: 'assinatura-todos-cursos',
    title: 'Assinatura com acesso a todos os cursos',
    excerpt: 'Planos de 1, 3, 6 e 12 meses com pagamento em reais e parcelamento mensal exibido.',
    date: '2026-04-15',
  },
  {
    slug: 'whatsapp-promocoes',
    title: 'Receba promoções pelo WhatsApp',
    excerpt: 'Cadastre-se gratuitamente e fique por dentro de ofertas e novos cursos.',
    date: '2026-04-01',
  },
]

export default function BlogPage() {
  return (
    <>
      <Header />
      <PageShell>
        <h1 className={siteTitleClass}>Blog</h1>
        <p className={`${siteMutedClass} mt-2 max-w-2xl`}>
          Dicas de estudo, carreira e novidades da plataforma.
        </p>
        <div className="mt-8 space-y-4">
          {posts.map((post) => (
            <article key={post.slug} className={`${siteCardClass} p-6`}>
              <time className="text-xs font-medium text-slate-500">{post.date}</time>
              <h2 className="mt-2 text-lg font-bold text-slate-900">{post.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
            </article>
          ))}
        </div>
        <p className="mt-8">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            ← Voltar ao início
          </Link>
        </p>
      </PageShell>
    </>
  )
}
