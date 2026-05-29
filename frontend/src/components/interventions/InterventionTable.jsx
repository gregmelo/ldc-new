import { useEffect, useState } from "react";
import { useInterventionStore } from "../../store";
import InterventionEditModal from "./InterventionEditModal";
import StatusBadge from "../ui/StatusBadge";

function formatDate(d) {
  if (!d) return "";
  const s = (d + "").split("T")[0].split("-");
  return `${s[2]}/${s[1]}/${s[0]}`;
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

export default function InterventionTable() {
  const { interventions, loading, fetch, remove, update } =
    useInterventionStore();
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetch();
  }, []);

  function exportCSV() {
    if (!interventions.length) return;
    const header = "Date;Volontaire;Type;Duree (min);Statut;Sujet;Notes";
    const rows = interventions.map(
      (r) =>
        `${(r.date || "").split("T")[0]};${r.nom};${r.type === "visio" ? "Visio/appel" : "Message"};${r.duree || ""};${r.status || ""};${r.sujet};${(r.notes || "").replace(/;/g, ",")}`,
    );
    downloadBlob(
      "\uFEFF" + [header, ...rows].join("\n"),
      "interventions_ldc.csv",
      "text/csv;charset=utf-8;",
    );
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm("Supprimer cette intervention ?")) return;
    await remove(id);
  }

  async function handleStatusChange(row, newStatus) {
    await update(row.id, {
      ...row,
      status: newStatus,
      duree: row.duree ? parseInt(row.duree) : null,
    });
  }

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-header__title">Toutes les interventions</span>
        <button className="btn btn--sm" onClick={exportCSV}>
          ↓ CSV
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Volontaire</th>
              <th>Type</th>
              <th>Statut</th>
              <th className="col-sujet">Sujet</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="empty">
                  Chargement...
                </td>
              </tr>
            )}
            {!loading && !interventions.length && (
              <tr>
                <td colSpan={6} className="empty">
                  Aucune intervention enregistrée.
                </td>
              </tr>
            )}
            {!loading &&
              interventions.map((row) => (
                <tr
                  key={row.id}
                  className="row-clickable"
                  onClick={() => setEditing(row)}
                >
                  <td>{formatDate(row.date)}</td>
                  <td>{row.nom}</td>
                  <td>
                    <span className={`badge badge--${row.type}`}>
                      {row.type === "visio" ? "📹 Visio" : "💬 Msg"}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={row.status || "en_cours"}
                      onChange={(e) => handleStatusChange(row, e.target.value)}
                      className={`status status--${row.status || "en_cours"} status-select`}
                    >
                      <option value="en_cours">🔄 En cours</option>
                      <option value="resolu">✅ Résolu</option>
                      <option value="en_attente">⏳ En attente retour</option>
                      <option value="annule">❌ Annulé</option>
                      <option value="envoye_support">
                        📤 Envoie vers le support du Béthel
                      </option>
                    </select>
                  </td>
                  <td
                    className="col-sujet"
                    style={{
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={row.sujet}
                  >
                    {row.sujet}
                  </td>
                  <td>
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={(e) => handleDelete(e, row.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <InterventionEditModal
        intervention={editing}
        onClose={() => {
          setEditing(null);
          fetch();
        }}
      />
    </div>
  );
}
