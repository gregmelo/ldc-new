import { useEffect, useState } from "react";
import { useInterventionStore } from "../../store";
import { STATUS_CONFIG } from "../ui/StatusBadge";
import { exportRapportPDF } from '../../utils/pdfExport';

function getQuarter(dateStr) {
  const d = (dateStr || "").split("T")[0];
  const parts = d.split("-");
  return `${parts[0]}-T${Math.ceil(parseInt(parts[1]) / 3)}`;
}

function quarterLabel(q) {
  const [y, t] = q.split("-");
  return `${t} ${y}`;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StatsPanel() {
  const { interventions, fetch } = useInterventionStore();
  const [quarter, setQuarter] = useState("");

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    const now = new Date();
    const current = `${now.getFullYear()}-T${Math.ceil((now.getMonth() + 1) / 3)}`;
    if (!quarter) setQuarter(current);
  }, []);

  const now = new Date();
  const currentQ = `${now.getFullYear()}-T${Math.ceil((now.getMonth() + 1) / 3)}`;
  const seen = {};
  const quarters = [];
  interventions.forEach((r) => {
    const q = getQuarter(r.date);
    if (!seen[q]) {
      seen[q] = true;
      quarters.push(q);
    }
  });
  quarters.sort().reverse();
  if (!quarters.includes(currentQ)) quarters.unshift(currentQ);
  const q = quarter || currentQ;

  const rows = interventions.filter((r) => getQuarter(r.date) === q);
  const visios = rows.filter((r) => r.type === "visio");
  const msgs = rows.filter((r) => r.type === "message");
  const totalMin = visios.reduce((s, r) => s + (parseInt(r.duree) || 0), 0);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const timeStr = (h > 0 ? `${h}h ` : "") + `${m}min`;

  const byPerson = {};
  rows.forEach((r) => {
    byPerson[r.nom] = (byPerson[r.nom] || 0) + 1;
  });
  const personEntries = Object.entries(byPerson).sort((a, b) => b[1] - a[1]);

  function exportCSV() {
    let csv = "\uFEFF";
    csv += `Rapport trimestriel;${quarterLabel(q)}\n\n`;
    csv += `Total interventions;${rows.length}\n`;
    csv += `Visios / appels;${visios.length}\n`;
    csv += `Aides par message;${msgs.length}\n`;
    csv += `Temps en visio;${timeStr} (${totalMin} min)\n\n`;
    csv += `Volontaire;Nb interventions\n`;
    personEntries.forEach(([n, c]) => {
      csv += `${n};${c}\n`;
    });
    downloadBlob(csv, `rapport_${q}.csv`, "text/csv;charset=utf-8;");
  }

  async function exportPDF() {
    await exportRapportPDF(interventions, quarterLabel(q), [
      "chart-evolution",
      "chart-statuts",
      "chart-top",
    ]);
  }

  return (
    <div className="card">
      <div className="quarter-row">
        <label className="quarter-row__label">Trimestre :</label>
        <select value={q} onChange={(e) => setQuarter(e.target.value)}>
          {quarters.map((qr) => (
            <option key={qr} value={qr}>
              {quarterLabel(qr)}
            </option>
          ))}
        </select>
        <div className="btn-group" style={{ marginLeft: "auto" }}>
          <button className="btn btn--sm" onClick={exportPDF}>
            ↓ PDF
          </button>
          <button className="btn btn--sm" onClick={exportCSV}>
            ↓ CSV
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <div className="metric__label">Total interventions</div>
          <div className="metric__value">{rows.length}</div>
        </div>
        <div className="metric">
          <div className="metric__label">Visios / appels</div>
          <div className="metric__value">{visios.length}</div>
        </div>
        <div className="metric">
          <div className="metric__label">Aides par message</div>
          <div className="metric__value">{msgs.length}</div>
        </div>
        <div className="metric">
          <div className="metric__label">Temps en visio</div>
          <div className="metric__value">{timeStr}</div>
          <div className="metric__sub">{totalMin} min au total</div>
        </div>
      </div>

      {/* Stats par statut */}
      <div className="status-stats" style={{ marginBottom: "1.25rem" }}>
        {Object.entries(
          rows.reduce((acc, r) => {
            const s = r.status || "en_cours";
            acc[s] = (acc[s] || 0) + 1;
            return acc;
          }, {}),
        ).map(([status, count]) => (
          <div key={status} className="status-stat">
            <span>{STATUS_CONFIG[status]?.icon}</span>
            <span className="status-stat__count">{count}</span>
            <span className="status-stat__label">
              {STATUS_CONFIG[status]?.label}
            </span>
          </div>
        ))}
      </div>

      {!rows.length ? (
        <div className="empty">Aucune intervention ce trimestre.</div>
      ) : (
        <>
          <div
            style={{ fontWeight: 600, fontSize: 14, marginBottom: "0.75rem" }}
          >
            Détail par volontaire
          </div>
          <table>
            <thead>
              <tr>
                <th>Volontaire</th>
                <th>Nb interventions</th>
              </tr>
            </thead>
            <tbody>
              {personEntries.map(([n, c]) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
