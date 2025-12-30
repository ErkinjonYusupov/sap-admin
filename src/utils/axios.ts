import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'uz',
  },
})
http.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('token')
  if (accessToken)
    config.headers.Authorization = `Bearer ${accessToken}`
  return config
})
http.interceptors.response.use(conf => conf,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      location.reload()
    }
    return Promise.reject(error)
  },
)

export default http
