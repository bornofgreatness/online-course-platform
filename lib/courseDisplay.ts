/** Remove seed prefix so listings show the topic name first. */
export function courseDisplayTitle(title: string): string {
  const stripped = title
    .replace(/^Certificado\s+100\s*h\s*[—–-]\s*/i, '')
    .replace(/^Certificado\s+100h\s*[—–-]\s*/i, '')
    .trim()
  return stripped || title
}
