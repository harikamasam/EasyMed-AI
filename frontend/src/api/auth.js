export const AUTH_TOKEN_KEY = "easymed_token"
export const AUTH_USER_KEY = "easymed_user"

export function saveSession(authResponse) {
  localStorage.setItem(AUTH_TOKEN_KEY, authResponse.token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authResponse.user))
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getCurrentUser() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY)
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser)
  } catch {
    clearSession()
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getToken())
}
