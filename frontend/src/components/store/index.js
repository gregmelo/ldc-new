import { create } from 'zustand'
import { api } from '../api/client'

// ---- Theme ----
function getInitialTheme() {
  const saved = localStorage.getItem('ldc_theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('ldc_theme', next)
    document.documentElement.setAttribute('data-theme', next)
    set({ theme: next })
  },
  init: () => {
    document.documentElement.setAttribute('data-theme', get().theme)
  },
}))

// ---- Auth ----
export const useAuthStore = create((set) => ({
  token: sessionStorage.getItem('ldc_token') || null,
  user: (() => {
    try { return JSON.parse(sessionStorage.getItem('ldc_user') || 'null') } catch { return null }
  })(),

  login: async (username, password) => {
    const data = await api.login(username, password)
    if (data?.token) {
      sessionStorage.setItem('ldc_token', data.token)
      sessionStorage.setItem('ldc_user', JSON.stringify({ username: data.username, role: data.role }))
      set({ token: data.token, user: { username: data.username, role: data.role } })
      return { success: true }
    }
    return { success: false, error: data?.error || 'Identifiants incorrects' }
  },

  logout: () => {
    sessionStorage.clear()
    set({ token: null, user: null })
  },
}))

// ---- Interventions ----
export const useInterventionStore = create((set, get) => ({
  interventions: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    const data = await api.getInterventions()
    set({ interventions: data || [], loading: false })
  },

  create: async (payload) => {
    const result = await api.createIntervention(payload)
    if (result?.success) await get().fetch()
    return result
  },

  update: async (id, payload) => {
    const result = await api.updateIntervention(id, payload)
    if (result?.success) await get().fetch()
    return result
  },

  remove: async (id) => {
    await api.deleteIntervention(id)
    set((s) => ({ interventions: s.interventions.filter((i) => i.id !== id) }))
  },
}))

// ---- Users ----
export const useUserStore = create((set) => ({
  users: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    const data = await api.getUsers()
    set({ users: data || [], loading: false })
  },

  create: async (payload) => api.createUser(payload),

  remove: async (id) => {
    await api.deleteUser(id)
    set((s) => ({ users: s.users.filter((u) => u.id !== id) }))
  },

  updatePassword: async (id, password) => api.updatePassword(id, password),
}))
