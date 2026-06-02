import { useEffect, useState } from "react";
import { useInterventionStore } from "../../store";
import InterventionEditModal from "./InterventionEditModal";
import VolunteerPanel from "./VolunteerPanel";
import { CATEGORIES } from '../../utils/categories'

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

const STATUS_CONFIG = {
  en_cours: { label: "En cours", icon: "🔄" },
  resolu: { label: "Résolu", icon: "✅" },
  en_attente: { label: "En attente retour", icon: "⏳" },
  annule: { label: "Annulé", icon: "❌" },
  envoye_support: { label: "Support Béthel", icon: "📤" },
};

function StatusSelect({ row, onChange }) {
  return (
    <select
      value={row.status || "en_cours"}
      onChange={(e) => onChange(row, e.target.value)}
      className={`status status--${row.status || "en_cours"} status-select`}
      onClick={(e) => e.stopPropagation()}
    >
      <option value="en_cours">🔄 En cours</option>
      <option value="resolu">✅ Résolu</option>
      <option value="en_attente">⏳ En attente retour</option>
      <option value="annule">❌ Annulé</option>
      <option value="envoye_support">📤 Support Béthel</option>
    </select>
  );
}

export default function InterventionTable() {
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const { interventions, loading, fetch, remove, update } =
    useInterventionStore();
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetch();
  }, []);

  async function handleStatusChange(row, newStatus) {
    await update(row.id, {
      ...row,
      status: newStatus,
      duree: row.duree ? parseInt(row.duree) : null,
    });
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm("Supprimer cette intervention ?")) return;
    await remove(id);
  }

  function exportCSV() {
    if (!filtered.length) return;
    const header = "Date;Volontaire;Type;Duree (min);Statut;Sujet;Notes";
    const rows = filtered.map(
      (r) =>
        `${(r.date || "").split("T")[0]};${r.nom};${r.type === "visio" ? "Visio/appel" : "Message"};${r.duree || ""};${r.status || ""};${r.sujet};${(r.notes || "").replace(/;/g, ",")}`,
    );
    downloadBlob(
      "\uFEFF" + [header, ...rows].join("\n"),
      "interventions_ldc.csv",
      "text/csv;charset=utf-8;",
    );
  }

  // Stats par statut
  const statusCounts = interventions.reduce((acc, r) => {
    const s = r.status || "en_cours";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const filtered = interventions.filter((r) => {
    const matchSearch =
      !search ||
      r.nom.toLowerCase().includes(search.toLowerCase()) ||
      r.sujet.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchType = !filterType || r.type === filterType;
    const matchCategory = !filterCategory || r.category === filterCategory;
    return matchSearch && matchStatus && matchType && matchCategory;
  });

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-header__title">Toutes les interventions</span>
        <button className="btn btn--sm" onClick={exportCSV}>
          ↓ CSV
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="Rechercher un volontaire, sujet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            padding: "7px 11px",
            border: "0.5px solid var(--border2)",
            borderRadius: 8,
            background: "var(--surface2)",
            color: "var(--text)",
            fontSize: 13,
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "7px 11px",
            border: "0.5px solid var(--border2)",
            borderRadius: 8,
            background: "var(--surface2)",
            color: "var(--text)",
            fontSize: 13,
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="en_cours">🔄 En cours</option>
          <option value="resolu">✅ Résolu</option>
          <option value="en_attente">⏳ En attente retour</option>
          <option value="annule">❌ Annulé</option>
          <option value="envoye_support">📤 Support Béthel</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: "7px 11px",
            border: "0.5px solid var(--border2)",
            borderRadius: 8,
            background: "var(--surface2)",
            color: "var(--text)",
            fontSize: 13,
          }}
        >
          <option value="">Tous les types</option>
          <option value="visio">📹 Visio</option>
          <option value="message">💬 Message</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "7px 11px",
            border: "0.5px solid var(--border2)",
            borderRadius: 8,
            background: "var(--surface2)",
            color: "var(--text)",
            fontSize: 13,
          }}
        >
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Stats statut */}
      {interventions.length > 0 && (
        <div className="status-stats">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="status-stat">
              <span>{STATUS_CONFIG[status]?.icon}</span>
              <span className="status-stat__count">{count}</span>
              <span className="status-stat__label">
                {STATUS_CONFIG[status]?.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tableau desktop */}
      <div className="table-wrap table-desktop">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Volontaire</th>
              <th>Type</th>
              <th>Statut</th>
              <th className="col-sujet">Sujet</th>
              <th className="col-category">Catégorie</th>
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
            {!loading && !filtered.length && (
              <tr>
                <td colSpan={6} className="empty">
                  Aucune intervention enregistrée.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="row-clickable"
                  onClick={() => setEditing(row)}
                >
                  <td>{formatDate(row.date)}</td>
                  <td>
                    <span
                      style={{ cursor: "pointer", fontWeight: 500 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVolunteer(row.nom);
                      }}
                    >
                      {row.nom}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge--${row.type}`}>
                      {row.type === "visio" ? "📹 Visio" : "💬 Msg"}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <StatusSelect row={row} onChange={handleStatusChange} />
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
                  <td className="col-category">{row.category || 'Autre'}</td>
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

      {/* Cards mobile */}
      <div className="intervention-cards">
        {loading && <div className="empty">Chargement...</div>}
        {!loading && !filtered.length && (
          <div className="empty">Aucune intervention enregistrée.</div>
        )}
        {!loading &&
          filtered.map((row) => (
            <div
              key={row.id}
              className="intervention-card"
              onClick={() => setEditing(row)}
            >
              <div className="intervention-card__header">
                <span
                  className="intervention-card__name"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVolunteer(row.nom);
                  }}
                >
                  {row.nom}
                </span>
                <span className="intervention-card__date">
                  {formatDate(row.date)}
                </span>
              </div>
              <div className="intervention-card__meta">
                <span className={`badge badge--${row.type}`}>
                  {row.type === "visio" ? "📹 Visio" : "💬 Msg"}
                </span>
                {row.type === "visio" && row.duree && (
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>
                    {row.duree} min
                  </span>
                )}
              </div>
              <div className="intervention-card__sujet">{row.sujet}</div>
              <div
                className="intervention-card__footer"
                onClick={(e) => e.stopPropagation()}
              >
                <StatusSelect row={row} onChange={handleStatusChange} />
                <button
                  className="btn btn--danger btn--sm"
                  onClick={(e) => handleDelete(e, row.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
      </div>

      <InterventionEditModal
        intervention={editing}
        onClose={() => {
          setEditing(null);
          fetch();
        }}
      />

      {selectedVolunteer && (
        <VolunteerPanel
          name={selectedVolunteer}
          interventions={interventions}
          onClose={() => setSelectedVolunteer(null)}
        />
      )}
    </div>
  );
}
