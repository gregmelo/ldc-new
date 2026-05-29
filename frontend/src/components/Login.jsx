import { useState } from 'react'
import { useAuthStore } from '../store'

export default function Login() {
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!username || !password) return
    setLoading(true)
    setError('')
    const result = await login(username, password)
    if (!result.success) setError(result.error)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="login-card">
        <h1>Suivi LDC</h1>
        <p>Connectez-vous pour accéder à l'outil.</p>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Nom d'utilisateur</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <div className="alert alert--error">{error}</div>}

        <button
          className="btn btn--primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </div>
  )
}
