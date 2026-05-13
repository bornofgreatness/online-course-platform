/** Resolved download path for a certificate PDF (handles legacy placeholder URLs). */
export function certificatePdfDownloadPath(certificateNumber: string, storedPdfUrl: string): string {
  if (storedPdfUrl.startsWith('/api/certificates/pdf/')) {
    return storedPdfUrl
  }
  return `/api/certificates/pdf/${encodeURIComponent(certificateNumber)}`
}
