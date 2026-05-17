'use client'

import Link from 'next/link'
import Header from './Header'
import PricingPlans from './PricingPlans'
import WhatsAppFloat from './WhatsAppButton'
import { countCatalogCourses, PLATFORM_CATALOG } from '../lib/platformCatalog'
import { useI18n } from './LanguageProvider'

const testimonials = [
  {
    name: 'Mariana S.',
    role: 'Professora — SP',
    text: 'Consegui me atualizar em metodologias ativas e já aplico na sala de aula. O certificado de 100h fez diferença no meu currículo.',
  },
  {
    name: 'Carlos R.',
    role: 'Assistente social — MG',
    text: 'Os cursos de SUAS e CRAS são completos. Estudo no celular e baixo o certificado em PDF quando termino.',
  },
  {
    name: 'Ana Paula L.',
    role: 'Empreendedora — PR',
    text: 'Marketing digital e IA para negócios me ajudaram a organizar minhas redes. Assinatura por 3 meses valeu muito.',
  },
]

const faqs = [
  {
    q: 'Como funciona a assinatura?',
    a: 'Você escolhe um plano (1, 3, 6 ou 12 meses), paga com cartão ou boleto e tem acesso a todos os cursos do catálogo durante o período.',
  },
  {
    q: 'O certificado é reconhecido?',
    a: 'Cada curso emite certificado de 100 horas com código único de verificação online, nome do aluno, curso e data de conclusão.',
  },
  {
    q: 'Posso estudar pelo celular?',
    a: 'Sim. A plataforma é responsiva e otimizada para mobile — assista aulas, leia PDFs e acompanhe seu progresso de qualquer lugar.',
  },
  {
    q: 'Preciso pagar para se cadastrar?',
    a: 'Não. O cadastro gratuito permite explorar o catálogo e receber novidades. O conteúdo premium é liberado com a assinatura.',
  },
]

export default function LandingPage() {
  const { t } = useI18n()
  const totalCourses = countCatalogCourses()

  return (
    <>
      <Header />
      <WhatsAppFloat />

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-200">
            +{totalCourses} cursos · 7 áreas · Certificado 100h
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Plataforma de cursos online com certificado e acesso por assinatura
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-blue-100">
            Educação, informática, inteligência artificial, saúde, marketing, empregabilidade e assistência social —
            tudo em português, com materiais em vídeo e PDF.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/auth/signup"
              className="rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-blue-950 shadow-lg transition hover:bg-teal-50"
            >
              Inscreva-se Gratuitamente
            </Link>
            <Link
              href="/courses"
              className="rounded-full border-2 border-white/80 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/10"
            >
              {t('common.browseCourses')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Categorias em destaque</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Navegue por subcategorias especializadas em cada área do conhecimento.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_CATALOG.map((cat) => (
            <Link
              key={cat.name}
              href="/categories"
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageUrl}
                alt=""
                className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
              />
              <div className="p-5">
                <h3 className="font-bold text-slate-900">{cat.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {cat.subcategories.length} subcategorias ·{' '}
                  {cat.subcategories.reduce((n, s) => n + s.courses.length, 0)} cursos
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-6">
          {[
            { n: '7', label: 'Categorias' },
            { n: '30+', label: 'Subcategorias' },
            { n: `${totalCourses}+`, label: 'Cursos' },
            { n: '100h', label: 'Por certificado' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-blue-900">{s.n}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="planos" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Planos de assinatura</h2>
        <p className="mt-2 text-slate-600">Acesso a todo o catálogo. Pagamento em reais (R$).</p>
        <div className="mt-8">
          <PricingPlans />
        </div>
      </section>

      <section className="bg-blue-950 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">O que dizem nossos alunos</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.name} className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <p className="text-sm leading-relaxed text-blue-50">&ldquo;{item.text}&rdquo;</p>
                <footer className="mt-4 text-sm font-semibold text-teal-200">
                  {item.name} — {item.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6">
        <h2 className="text-2xl font-bold text-slate-900">Comece agora — cadastro grátis</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Cadastre-se para montar sua base de estudos, receber ofertas e falar conosco pelo WhatsApp.
        </p>
        <Link
          href="/auth/signup"
          className="mt-6 inline-block rounded-full bg-blue-600 px-10 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-blue-700"
        >
          Cadastro Grátis
        </Link>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">Perguntas frequentes</h2>
          <dl className="mt-8 space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-slate-900">{f.q}</dt>
                <dd className="mt-2 text-sm text-slate-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="contato" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-2xl font-bold text-slate-900">Contato</h2>
        <p className="mt-2 text-slate-600">
          Dúvidas sobre planos ou parcerias? Fale conosco pelo WhatsApp ou cadastre-se gratuitamente.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
          >
            WhatsApp
          </a>
          <Link
            href="/auth/signup"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Inscreva-se Gratuitamente
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Plataforma de Cursos Online · Português (Brasil) · Moeda: BRL</p>
        <p className="mt-2">
          <Link href="/courses" className="text-blue-600 hover:underline">
            Cursos
          </Link>
          {' · '}
          <Link href="/pricing" className="text-blue-600 hover:underline">
            Preços
          </Link>
          {' · '}
          <Link href="/blog" className="text-blue-600 hover:underline">
            Blog
          </Link>
        </p>
      </footer>
    </>
  )
}
