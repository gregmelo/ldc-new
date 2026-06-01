import Modal from '../ui/Modal'

function formatDate(d) {
  if (!d) return ''
  const s = (d + '').split('T')[0].split('-')
  return `${s[2]}/${s[1]}/${s[0]}`
}

function formatDateTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('fr-FR')
}

export default function InterventionModal({ intervention, onClose }) {
  if (!intervention) return null
  const r = intervention

  return (
    <Modal open={!!intervention} onClose={onClose} title="Détail de l'intervention">
      <div className="detail-row">
        <span className="detail-row__label">Date</span>
        <span className="detail-row__value">{formatDate(r.date)}</span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">Volontaire</span>
        <span className="detail-row__value">{r.nom}</span>
      </div>
      <div className="detail-row">
        <span className="detail-row__label">Type</span>
        <span className="detail-row__value">
          <span className={`badge badge--${r.type}`}>
            {r.type === 'visio' ? '📹 Visio / appel' : '💬 Aide par message'}
          </span>
        </span>
      </div>
      {r.type === 'visio' && r.duree && (
        <div className="detail-row">
          <span className="detail-row__label">Durée</span>
          <span className="detail-row__value">{r.duree} minutes</span>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-row__label">Sujet</span>
        <span className="detail-row__value">{r.sujet}</span>
      </div>
      {r.notes && (
        <div className="detail-row" style={{ flexDirection: 'column', gap: 6 }}>
          <span className="detail-row__label">Notes</span>
          <div
            className="detail-notes"
            dangerouslySetInnerHTML={{ __html: r.notes || ''}}
          />
        </div>
      )}
      {r.created_at && (
        <div className="detail-row" style={{ marginTop: 8 }}>
          <span className="detail-row__label" style={{ fontSize: 11, color: 'var(--text3)' }}>Enregistré le</span>
          <span className="detail-row__value" style={{ fontSize: 11, color: 'var(--text3)' }}>{formatDateTime(r.created_at)}</span>
        </div>
      )}
    </Modal>
  )
}
