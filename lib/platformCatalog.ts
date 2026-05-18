/**
 * Canonical course catalog (TypeScript types + re-export from seed catalog).
 */

const catalog = require('./platformCatalog.cjs') as {
  PLATFORM_CATALOG: CatalogCategory[]
  DEFAULT_WORKLOAD_HOURS: number
  DEFAULT_PDF_URL: string
  DEFAULT_THUMBNAIL: string
  countCatalogCourses: () => number
}

export type CatalogCourse = { title: string; description?: string }
export type CatalogSubcategory = { name: string; courses: CatalogCourse[] }
export type CatalogCategory = {
  name: string
  icon: string
  imageUrl: string
  sortOrder: number
  subcategories: CatalogSubcategory[]
}

export const PLATFORM_CATALOG = catalog.PLATFORM_CATALOG
export const DEFAULT_WORKLOAD_HOURS = catalog.DEFAULT_WORKLOAD_HOURS
export const DEFAULT_PDF_URL = catalog.DEFAULT_PDF_URL
export const DEFAULT_THUMBNAIL = catalog.DEFAULT_THUMBNAIL
export const countCatalogCourses = catalog.countCatalogCourses
