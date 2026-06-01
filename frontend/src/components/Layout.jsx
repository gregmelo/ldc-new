import { useState, useEffect } from 'react'
import { useAuthStore, useThemeStore } from '../store'
import InterventionForm  from './interventions/InterventionForm'
import InterventionTable from './interventions/InterventionTable'
import StatsPanel        from './stats/StatsPanel'
import UserTable         from './users/UserTable'
import Dashboard from './dashboard/Dashboard'
import ActivityLogPanel from './dashboard/ActivityLogPanel'

const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'saisie', label: '+ Nouvelle' },
  { id: 'liste',  label: 'Historique' },
  { id: 'stats',  label: 'Rapport' },
  { id: 'activity', label: '📋 Journal' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { theme, toggle, init } = useThemeStore()
  const [activeTab, setActiveTab] = useState('saisie')

  useEffect(() => { init() }, [])

  const tabs = user?.role === 'admin'
    ? [...TABS, { id: 'users', label: '👥 Équipe' }]
    : TABS

  return (
    <div>
      <header className="app-header">
        <h1>Suivi interventions LDC</h1>
        <div className="app-header__right">
          <span className="app-header__username">{user?.username}</span>
          <button className="theme-toggle" onClick={toggle} title="Changer le thème">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn btn--ghost" onClick={logout}>Déconnexion</button>
        </div>
      </header>

      <main className="main">
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'saisie' && <InterventionForm />}
        {activeTab === 'liste'  && <InterventionTable />}
        {activeTab === 'stats'  && <StatsPanel />}
        {activeTab === 'users'  && <UserTable />}
        {activeTab === 'activity' && <ActivityLogPanel />}
      </main>
    </div>
  )
}
