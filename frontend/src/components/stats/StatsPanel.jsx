import { useEffect, useState } from 'react'
import { useInterventionStore } from '../../store'

function getQuarter(dateStr) {
  const d = (dateStr || '').split('T')[0]
  const parts = d.split('-')
  return `${parts[0]}-T${Math.ceil(parseInt(parts[1]) / 3)}`
}

function quarterLabel(q) {
  const [y, t] = q.split('-')
  return `${t} ${y}`
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function StatsPanel() {
  const { interventions, fetch } = useInterventionStore()
  const [quarter, setQuarter] = useState('')

  useEffect(() => { fetch() }, [])

  useEffect(() => {
    const now = new Date()
    const current = `${now.getFullYear()}-T${Math.ceil((now.getMonth() + 1) / 3)}`
    if (!quarter) setQuarter(current)
  }, [])

  const now = new Date()
  const currentQ = `${now.getFullYear()}-T${Math.ceil((now.getMonth() + 1) / 3)}`
  const seen = {}
  const quarters = []
  interventions.forEach((r) => {
    const q = getQuarter(r.date)
    if (!seen[q]) { seen[q] = true; quarters.push(q) }
  })
  quarters.sort().reverse()
  if (!quarters.includes(currentQ)) quarters.unshift(currentQ)
  const q = quarter || currentQ

  const rows   = interventions.filter((r) => getQuarter(r.date) === q)
  const visios = rows.filter((r) => r.type === 'visio')
  const msgs   = rows.filter((r) => r.type === 'message')
  const totalMin = visios.reduce((s, r) => s + (parseInt(r.duree) || 0), 0)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  const timeStr = (h > 0 ? `${h}h ` : '') + `${m}min`

  const byPerson = {}
  rows.forEach((r) => { byPerson[r.nom] = (byPerson[r.nom] || 0) + 1 })
  const personEntries = Object.entries(byPerson).sort((a, b) => b[1] - a[1])

  function exportCSV() {
    let csv = '\uFEFF'
    csv += `Rapport trimestriel;${quarterLabel(q)}\n\n`
    csv += `Total interventions;${rows.length}\n`
    csv += `Visios / appels;${visios.length}\n`
    csv += `Aides par message;${msgs.length}\n`
    csv += `Temps en visio;${timeStr} (${totalMin} min)\n\n`
    csv += `Volontaire;Nb interventions\n`
    personEntries.forEach(([n, c]) => { csv += `${n};${c}\n` })
    downloadBlob(csv, `rapport_${q}.csv`, 'text/csv;charset=utf-8;')
  }

  function exportPDF() {
    const personRows = personEntries.map(([n, c]) => `<tr><td>${n}</td><td>${c}</td></tr>`).join('')
    const label = quarterLabel(q)
    const today = new Date().toLocaleDateString('fr-FR')
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Rapport ${label}</title>`
    html += `<style>body{font-family:Arial,sans-serif;padding:2rem;color:#1a1a18;max-width:600px;margin:0 auto}`
    html += `h1{font-size:22px;margin-bottom:.3rem}h2{font-size:15px;color:#5f5e5a;margin-bottom:1.5rem;font-weight:normal}`
    html += `.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:1.5rem}`
    html += `.metric{background:#f0efeb;border-radius:8px;padding:1rem}.l{font-size:12px;color:#5f5e5a;margin-bottom:4px}`
    html += `.v{font-size:22px;font-weight:700}table{width:100%;border-collapse:collapse;font-size:14px}`
    html += `th{text-align:left;padding:8px;border-bottom:1px solid #ddd;font-size:12px;color:#5f5e5a}`
    html += `td{padding:8px;border-bottom:1px solid #eee}.footer{margin-top:2rem;font-size:12px;color:#999}</style></head><body>`
    html += `<h1>Rapport trimestriel</h1><h2>Suivi interventions LDC — ${label}</h2>`
    html += `<div class="grid">`
    html += `<div class="metric"><div class="l">Total interventions</div><div class="v">${rows.length}</div></div>`
    html += `<div class="metric"><div class="l">Visios / appels</div><div class="v">${visios.length}</div></div>`
    html += `<div class="metric"><div class="l">Aides par message</div><div class="v">${msgs.length}</div></div>`
    html += `<div class="metric"><div class="l">Temps en visio</div><div class="v">${timeStr}</div></div>`
    html += `</div><h3>Détail par volontaire</h3>`
    html += `<table><thead><tr><th>Volontaire</th><th>Nb interventions</th></tr></thead><tbody>${personRows}</tbody></table>`
    html += `<div class="footer">Généré le ${today}</div></body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); win.onload = () => win.print() }
  }

  return (
    <div className="card">
      <div className="quarter-row">
        <label className="quarter-row__label">Trimestre :</label>
        <select value={q} onChange={(e) => setQuarter(e.target.value)}>
          {quarters.map((qr) => (
            <option key={qr} value={qr}>{quarterLabel(qr)}</option>
          ))}
        </select>
        <div className="btn-group" style={{ marginLeft: 'auto' }}>
          <button className="btn btn--sm" onClick={exportPDF}>↓ PDF</button>
          <button className="btn btn--sm" onClick={exportCSV}>↓ CSV</button>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric"><div className="metric__label">Total interventions</div><div className="metric__value">{rows.length}</div></div>
        <div className="metric"><div className="metric__label">Visios / appels</div><div className="metric__value">{visios.length}</div></div>
        <div className="metric"><div className="metric__label">Aides par message</div><div className="metric__value">{msgs.length}</div></div>
        <div className="metric"><div className="metric__label">Temps en visio</div><div className="metric__value">{timeStr}</div><div className="metric__sub">{totalMin} min au total</div></div>
      </div>

      {!rows.length ? (
        <div className="empty">Aucune intervention ce trimestre.</div>
      ) : (
        <>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: '0.75rem' }}>Détail par volontaire</div>
          <table>
            <thead><tr><th>Volontaire</th><th>Nb interventions</th></tr></thead>
            <tbody>
              {personEntries.map(([n, c]) => (
                <tr key={n}><td>{n}</td><td>{c}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
