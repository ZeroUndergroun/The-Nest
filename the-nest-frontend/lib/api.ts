import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && typeof window !== 'undefined') {
      original._retry = true
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/auth/refresh`,
          {},
          { withCredentials: true }
        )
        return api(original)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
