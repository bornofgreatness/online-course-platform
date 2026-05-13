function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i)
  return Math.abs(h)
}

const INSTRUCTORS = [
  'Prof. Ana Silva',
  'Pedro Costa',
  'Carla Reis',
  'John Doe',
  'Carlos Mendes',
  'Sofia Lima',
  'Marina Silva',
  'Lucas Rocha',
  'Fernanda Souza',
  'Ricardo Santos',
  'Gabriel Cruz',
  'Júlia Neves',
] as const

const RATINGS = [4.6, 4.7, 4.8, 4.9] as const

export function initialsFromName(name: string): string {
  const parts = name.replace(/^Prof\.\s*/i, '').trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const AVATAR_CLASSES = [
  'bg-sky-100 text-sky-900',
  'bg-violet-100 text-violet-900',
  'bg-amber-100 text-amber-900',
  'bg-emerald-100 text-emerald-900',
  'bg-rose-100 text-rose-900',
] as const

/** Stable rating, instructor, and USD price for list cards (not stored on Course). */
export function getCourseCardDisplay(courseId: string) {
  const h = hashString(courseId)
  const rating = RATINGS[h % RATINGS.length]
  const instructor = INSTRUCTORS[h % INSTRUCTORS.length]
  const price = 149 + (h % 11) * 10
  return {
    rating,
    instructor,
    priceLabel: `$${price.toFixed(2)}`,
    avatarClass: AVATAR_CLASSES[h % AVATAR_CLASSES.length],
  }
}

/** Visual parity for category browse cards (rating / curator row / footer count). */
export function getCategoryListCardDisplay(categoryId: string, courseCount: number) {
  const h = hashString(categoryId)
  const rating = RATINGS[h % RATINGS.length]
  return {
    rating,
    curator: 'Category catalog',
    avatarClass: AVATAR_CLASSES[h % AVATAR_CLASSES.length],
    footerLabel: courseCount === 1 ? '1 course' : `${courseCount} courses`,
  }
}
