export function matchesAdminSearch(
  query: string,
  ...parts: Array<string | number | null | undefined>
): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return parts.some((part) => String(part ?? '').toLowerCase().includes(normalized))
}
