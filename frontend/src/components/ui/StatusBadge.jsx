const STATUS_CONFIG = {
  en_cours:   { label: 'En cours',           icon: '🔄' },
  resolu:     { label: 'Résolu',             icon: '✅' },
  en_attente: { label: 'En attente retour',  icon: '⏳' },
  annule:     { label: 'Annulé',             icon: '❌' },
  envoye_support: { label: 'Envoyé support Béthel', icon: '📤' },
}

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({ value, label }))

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.en_cours
  return (
    <span className={`status status--${status}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}
