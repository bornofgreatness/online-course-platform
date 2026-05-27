import type { MetadataRoute } from 'next'
import { getPrisma } from '../lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/cursos-online-com-certificado', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/online-courses-with-certificate', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/courses', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/certificates', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/categories', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.75, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/auth/signin', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/auth/signup', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/auth/forgot-password', priority: 0.2, changeFrequency: 'yearly' as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  if (!process.env.DATABASE_URL) {
    return staticRoutes
  }

  try {
    const prisma = getPrisma()
    const [courses, categories] = await Promise.all([
      prisma.course.findMany({ select: { id: true, updatedAt: true } }),
      prisma.category.findMany({ select: { id: true, createdAt: true } }),
    ])

    const courseUrls: MetadataRoute.Sitemap = courses.map((c) => ({
      url: `${base}/courses/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${base}/categories/${c.id}`,
      lastModified: c.createdAt,
      changeFrequency: 'weekly',
      priority: 0.5,
    }))

    return [...staticRoutes, ...courseUrls, ...categoryUrls]
  } catch {
    return staticRoutes
  }
}
