const normalizeBaseUrl = (value, fallback) => {
  const resolved = (value ?? '').trim() || fallback
  return resolved.replace(/\/$/, '')
}

const gatewayApiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL, 'http://localhost:5000/api')

export const API_BASE_URLS = {
  gateway: gatewayApiBaseUrl,
  course: normalizeBaseUrl(import.meta.env.VITE_COURSE_API_URL, gatewayApiBaseUrl),
  student: normalizeBaseUrl(import.meta.env.VITE_STUDENT_API_URL, gatewayApiBaseUrl),
  payment: normalizeBaseUrl(import.meta.env.VITE_PAYMENT_API_URL, gatewayApiBaseUrl),
}
