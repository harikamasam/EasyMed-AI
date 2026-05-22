import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 8000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("easymed_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function isBackendUnavailable(error) {
  return !error.response
}

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error.response?.data?.detail || error.message || fallback
}
