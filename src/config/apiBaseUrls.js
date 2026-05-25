const DEFAULT_API_ORIGIN = 'https://localhost:7290'

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

<<<<<<< HEAD
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

=======
>>>>>>> cdd52d2e3a3c2342978ee1b688dbe713f7070834
export const API_BASE_URLS = {
  course: normalizeBaseUrl(import.meta.env.VITE_COURSE_API_URL, 'http://192.168.29.112:5001/api'),
  student: normalizeBaseUrl(import.meta.env.VITE_STUDENT_API_URL, 'http://192.168.29.112:5002/api'),
  payment: normalizeBaseUrl(import.meta.env.VITE_PAYMENT_API_URL, 'http://192.168.29.112:5003/api'),
}

if (import.meta.env.DEV) {
  console.info('[API_BASE_URLS]', API_BASE_URLS)
}
