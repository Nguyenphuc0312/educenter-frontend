const DEFAULT_API_ORIGIN = 'https://localhost:7290'

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function ensureApiPath(urlValue) {
  const sanitized = trimTrailingSlash(urlValue)
  if (/\/api$/i.test(sanitized)) {
    return sanitized
  }
  return `${sanitized}/api`
}

function normalizeBaseUrl(value, fallback) {
  const selected = (value ?? '').trim() || fallback

  try {
    const parsed = new URL(selected)
    const originWithPath = `${parsed.origin}${trimTrailingSlash(parsed.pathname)}`
    return ensureApiPath(originWithPath)
  } catch {
    return ensureApiPath(fallback)
  }
}

const gatewayApiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_ORIGIN)

export const API_BASE_URLS = {
  gateway: gatewayApiBaseUrl,
  course: normalizeBaseUrl(import.meta.env.VITE_COURSE_API_URL, gatewayApiBaseUrl),
  student: normalizeBaseUrl(import.meta.env.VITE_STUDENT_API_URL, gatewayApiBaseUrl),
  payment: normalizeBaseUrl(import.meta.env.VITE_PAYMENT_API_URL, gatewayApiBaseUrl),
}

if (import.meta.env.DEV) {
  console.info('[API_BASE_URLS]', API_BASE_URLS)
}
