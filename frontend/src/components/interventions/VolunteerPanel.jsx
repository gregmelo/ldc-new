import { useEffect, useRef } from 'react'
import { STATUS_CONFIG } from '../ui/StatusBadge'

function formatDate(d) {
  if (!d) return ''
  const s = (d + '').split('T')[0].split('-')
  return `${s[2]}/${s[1]}/${s[0]}`
}

export default function VolunteerPanel({ name, interventions, onClose }) {
  const panelRef = useRef(null)

  // Fermer avec Escape
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Bloquer le scroll du body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!name) return null

  const rows = interventions
    .filter(r => r.nom === name)
    .sort((a, b) => b.date.localeCompare(a.date))

  // Stats
  const total     = rows.length
  const resolus   = rows.filter(r => r.status === 'resolu').length
  const enCours   = rows.filter(r => r.status === 'en_cours').length
  const visioMin  = rows.filter(r => r.type === 'visio').reduce((s, r) => s + (parseInt(r.duree) || 0), 0)
  const h = Math.floor(visioMin / 60)
  const m = visioMin % 60

  // Dernière intervention
  const lastDate = rows.length > 0 ? formatDate(rows[0].date) : '—'

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
        }}
        onClick={onClose}
      />

      {/* Panneau */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 480,
          background: 'var(--surface)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 201,
          display: 'flex', flexDirection: 'column',
          animation: 'slideIn 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.1rem 1.25rem',
          borderBottom: '0.5px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
              Dernière intervention : {lastDate}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: 20,
              cursor: 'pointer', color: 'var(--text2)', padding: '4px 8px',
              borderRadius: 8,
            }}
          >✕</button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10, padding: '1rem 1.25rem',
          borderBottom: '0.5px solid var(--border)',
          flexShrink: 0,
        }}>
          <StatBox label="Total" value={total} />
          <StatBox label="Résolues" value={resolus} />
          <StatBox label="En cours" value={enCours} />
          <StatBox label="Temps visio" value={`${h > 0 ? h + 'h ' : ''}${m}min`} />
        </div>

        {/* Liste interventions */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0.75rem 1.25rem 2rem' }}>
          {rows.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem', fontSize: 14 }}>
              Aucune intervention
            </div>
          ) : (
            rows.map(row => (
              <div
                key={row.id}
                style={{
                  background: 'var(--surface2)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  marginBottom: 10,
                  border: '0.5px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(row.date)}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className={`badge badge--${row.type}`} style={{ fontSize: 11 }}>
                      {row.type === 'visio' ? '📹 Visio' : '💬 Msg'}
                    </span>
                    {row.type === 'visio' && row.duree && (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{row.duree} min</span>
                    )}
                  </div>
                </div>

                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>{row.sujet}</div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`status status--${row.status || 'en_cours'}`} style={{ fontSize: 11 }}>
                    {STATUS_CONFIG[row.status || 'en_cours']?.icon} {STATUS_CONFIG[row.status || 'en_cours']?.label}
                  </span>
                  {row.date_fin && (
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                      Clôturé le {formatDate(row.date_fin)}
                    </span>
                  )}
                </div>

                {row.notes && (
                  <div style={{
                    marginTop: 8, fontSize: 12, color: 'var(--text2)',
                    background: 'var(--surface)', borderRadius: 6,
                    padding: '6px 10px', lineHeight: 1.5,
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: row.notes }} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}

function StatBox({ label, value }) {
  return (
    <div style={{
      background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px',
    }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  )
}