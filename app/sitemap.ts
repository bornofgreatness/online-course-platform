import type { MetadataRoute } from 'next'
import { getPrisma } from '../lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/courses',
    '/categories',
    '/pricing',
    '/about',
    '/certificates',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'weekly',
    priority: path === '' ? 1 : 0.7,
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
