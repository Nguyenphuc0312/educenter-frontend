import axios from 'axios'

const tokenStorageKey = 'educenter_access_token'
const devFallbackApiBaseUrl = String(import.meta.env.VITE_API_FALLBACK_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '')

export function createHttpClient(baseURL) {
  const resolvedBaseUrl = String(baseURL ?? '').trim().replace(/\/+$/, '')
  if (!resolvedBaseUrl) {
    throw new Error(
      'Missing API base URL. Please define VITE_API_BASE_URL in .env and restart Vite dev server.',
    )
  }

  const client = axios.create({
    baseURL: resolvedBaseUrl,
    timeout: 10000,
  })

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem(tokenStorageKey)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const requestConfig = error?.config
      const isNetworkError = !error?.response
      const shouldRetryWithFallback =
        import.meta.env.DEV &&
        !!devFallbackApiBaseUrl &&
        isNetworkError &&
        requestConfig &&
        !requestConfig.__retriedWithFallback

      if (!shouldRetryWithFallback) {
        throw error
      }

      requestConfig.__retriedWithFallback = true
      requestConfig.baseURL = devFallbackApiBaseUrl
      return client.request(requestConfig)
    },
  )

  return client
}

export function saveAccessToken(token) {
  localStorage.setItem(tokenStorageKey, token)
}

export function clearAccessToken() {
  localStorage.removeItem(tokenStorageKey)
}
