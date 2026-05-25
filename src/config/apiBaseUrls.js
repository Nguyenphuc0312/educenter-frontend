const normalizeBaseUrl = (value, fallback) => {
  const resolved = (value ?? '').trim() || fallback
  return resolved.replace(/\/$/, '')
}

export const API_BASE_URLS = {
  course: normalizeBaseUrl(import.meta.env.VITE_COURSE_API_URL, 'http://192.168.29.112:5001/api'),
  student: normalizeBaseUrl(import.meta.env.VITE_STUDENT_API_URL, 'http://192.168.29.112:5002/api'),
  payment: normalizeBaseUrl(import.meta.env.VITE_PAYMENT_API_URL, 'http://192.168.29.112:5003/api'),
}
