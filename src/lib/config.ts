// Domain configuration utility
export function getDomain(): string {
  // In development, use localhost:3000
  if (process.env.NODE_ENV === 'development') {
    return process.env.DOMAIN_NAME || 'http://localhost:3000'
  }
  
  // In production, use the configured domain or fallback to clsh.app
  return process.env.DOMAIN_NAME || 'https://clash-nine-ebon.vercel.app'
}

// Helper function to get the full URL for a path
export function getFullUrl(path: string): string {
  const domain = getDomain()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${domain}${cleanPath}`
} 