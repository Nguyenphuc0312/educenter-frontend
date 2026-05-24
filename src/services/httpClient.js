import axios from 'axios'

const tokenStorageKey = 'educenter_access_token'

export function createHttpClient(baseURL) {
  const client = axios.create({
    baseURL,
    timeout: 10000,
  })

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem(tokenStorageKey)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  return client
}

export function saveAccessToken(token) {
  localStorage.setItem(tokenStorageKey, token)
}

export function clearAccessToken() {
  localStorage.removeItem(tokenStorageKey)
}
