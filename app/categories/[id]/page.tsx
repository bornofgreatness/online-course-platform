import { getPrisma } from '../../../lib/prisma'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../../components/PageShell'
import CourseListCard from '../../../components/CourseListCard'

interface Props {
  params: { id: string }
}

type CourseRow = {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
}

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: Props) {
  let category: {
    id: string
    name: string
    icon: string | null
    imageUrl: string | null
    courses: CourseRow[]
    subcategories: { id: string; name: string; courses: CourseRow[] }[]
  } | null = null

  if (process.env.DATABASE_URL) {
    try {
      const prisma = getPrisma()
      category = await prisma.category.findUnique({
        where: { id: params.id },
        include: {
          subcategories: {
            orderBy: { name: 'asc' },
            include: {
              courses: {
                orderBy: { title: 'asc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
          courses: {
            orderBy: { title: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              thumbnailUrl: true,
            },
          },
        },
      })
    } catch {
      category = null
    }
  }

  if (!category) {
    return (
      <>
        <Header />
        <PageShell>
          <p className={siteMutedClass}>Categoria não encontrada.</p>
          <Link href="/categories" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
            Voltar às categorias
          </Link>
        </PageShell>
      </>
    )
  }

  const totalCourses =
    category.subcategories.length > 0
      ? category.subcategories.reduce((n, s) => n + s.courses.length, 0)
      : category.courses.length

  return (
    <>
      <Header />
      <PageShell>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">Categoria</p>
            <h1 className={`${siteTitleClass} mt-1`}>{category.name}</h1>
            <p className={`${siteMutedClass} mt-2`}>
              {totalCourses} curso{totalCourses !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/categories" className="text-blue-600 hover:underline">
              Todas as categorias
            </Link>
            <Link href="/courses" className="text-blue-600 hover:underline">
              Todos os cursos
            </Link>
          </div>
        </div>

        {category.imageUrl ? (
          <div className="mb-8 overflow-hidden rounded-2xl bg-slate-200 shadow-md ring-1 ring-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={category.imageUrl} alt="" className="max-h-56 w-full object-cover" />
          </div>
        ) : null}

        {category.subcategories.length > 0 ? (
          <div className="space-y-10">
            {category.subcategories.map((sub) => (
              <section key={sub.id}>
                <h2 className="text-lg font-bold text-slate-900">{sub.name}</h2>
                <p className={`${siteMutedClass} mt-1 text-sm`}>
                  {sub.courses.length} curso{sub.courses.length !== 1 ? 's' : ''}
                </p>
                {sub.courses.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sub.courses.map((course) => (
                      <CourseListCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : category.courses.length === 0 ? (
          <div className={`${siteCardClass} p-10 text-center ${siteMutedClass}`}>Nenhum curso nesta categoria ainda.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {category.courses.map((course) => (
              <CourseListCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}
