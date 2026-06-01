const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, method = 'GET', body = null) {
  const token = sessionStorage.getItem('ldc_token')
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(API_BASE + path, opts)

  if (res.status === 401) {
    sessionStorage.clear()
    window.location.reload()
    return null
  }

  return res.json()
}

export const api = {
  login: (username, password) =>
    request('/login', 'POST', { username, password }),
  me: () => request('/me'),

  getInterventions: () => request('/interventions'),
  createIntervention: (data) => request('/interventions', 'POST', data),
  updateIntervention: (id, data) => request(`/interventions/${id}`, 'PUT', data),
  deleteIntervention: (id) => request(`/interventions/${id}`, 'DELETE'),

  getUsers: () => request('/users'),
  createUser: (data) => request('/users', 'POST', data),
  deleteUser: (id) => request(`/users/${id}`, 'DELETE'),
  updatePassword: (id, password) =>
    request(`/users/${id}/password`, 'PUT', { password }),

  // Activity log  ← ajoute ici
  getActivityLog: (offset = 0, limit = 25) =>
    request(`/activity-log?offset=${offset}&limit=${limit}`),
}
