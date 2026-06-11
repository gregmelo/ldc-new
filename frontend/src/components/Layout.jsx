import { useState, useEffect } from 'react'
import { useAuthStore, useThemeStore } from '../store'
import InterventionForm  from './interventions/InterventionForm'
import InterventionTable from './interventions/InterventionTable'
import StatsPanel        from './stats/StatsPanel'
import UserTable         from './users/UserTable'
import Dashboard         from './dashboard/Dashboard'
import ActivityLogPanel  from './dashboard/ActivityLogPanel'
import Modal             from './ui/Modal'
import { useSessionTimeout }     from '../hooks/useSessionTimeout'
import { useKeyboardShortcuts }  from '../hooks/useKeyboardShortcuts'

const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'saisie',    label: '+ Nouvelle' },
  { id: 'liste',     label: 'Historique' },
  { id: 'stats',     label: 'Rapport' },
]

const ADMIN_TABS = [
  { id: 'activity', label: '📋 Journal' },
  { id: 'users',    label: '👥 Équipe' },
]

export default function Layout() {
  useSessionTimeout()
  const { user, logout }    = useAuthStore()
  const { theme, toggle, init } = useThemeStore()
  const [activeTab, setActiveTab] = useState('dashboard')
  const isAdmin = user?.role === 'admin'

  const { showHelp, setShowHelp } = useKeyboardShortcuts(setActiveTab, isAdmin)

  useEffect(() => { init() }, [])

  const tabs = isAdmin ? [...TABS, ...ADMIN_TABS] : TABS

  return (
    <div>
      <header className="app-header">
        <h1>Suivi interventions LDC</h1>
        <div className="app-header__right">
          <span className="app-header__username">{user?.username}</span>
          <button
            className="btn btn--sm btn--ghost"
            onClick={() => setShowHelp(true)}
            title="Raccourcis clavier"
            style={{ fontWeight: 600 }}
          >?</button>
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
        {activeTab === 'saisie'    && <InterventionForm />}
        {activeTab === 'liste'     && <InterventionTable />}
        {activeTab === 'stats'     && <StatsPanel />}
        {activeTab === 'activity'  && <ActivityLogPanel />}
        {activeTab === 'users'     && <UserTable />}
      </main>

      {/* Modale raccourcis clavier */}
      <Modal open={showHelp} onClose={() => setShowHelp(false)} title="Raccourcis clavier">
        <table style={{ width: '100%', fontSize: 14 }}>
          <tbody>
            {[
              ['N', 'Nouvelle intervention'],
              ['H', 'Historique'],
              ['R', 'Rapport'],
              ['D', 'Dashboard'],
              ...(isAdmin ? [['J', 'Journal d\'activité'], ['E', 'Équipe']] : []),
              ['?', 'Afficher / masquer cette aide'],
              ['Esc', 'Fermer'],
            ].map(([key, label]) => (
              <tr key={key}>
                <td style={{ padding: '6px 0', width: 60 }}>
                  <kbd style={{
                    background: 'var(--surface2)',
                    border: '0.5px solid var(--border2)',
                    borderRadius: 4,
                    padding: '2px 8px',
                    fontSize: 13,
                    fontFamily: 'monospace',
                  }}>{key}</kbd>
                </td>
                <td style={{ padding: '6px 0', color: 'var(--text2)' }}>{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </div>
  )
}