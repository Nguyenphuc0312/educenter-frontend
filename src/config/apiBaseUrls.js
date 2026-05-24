const normalizeBaseUrl = (value, fallback) => {
  const resolved = (value ?? '').trim() || fallback
  return resolved.replace(/\/$/, '')
}

export const API_BASE_URLS = {
  course: normalizeBaseUrl(import.meta.env.VITE_COURSE_API_URL, 'http://localhost:5001/api'),
  student: normalizeBaseUrl(import.meta.env.VITE_STUDENT_API_URL, 'http://localhost:5002/api'),
  payment: normalizeBaseUrl(import.meta.env.VITE_PAYMENT_API_URL, 'http://localhost:5003/api'),
}
