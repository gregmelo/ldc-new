import { useEffect, useState } from "react";
import { api } from "../../api/client";

const ACTION_CONFIG = {
  create: { label: "Création", icon: "➕", color: "var(--success-text)" },
  update: { label: "Modification", icon: "✏️", color: "var(--accent-text)" },
  status_change: {
    label: "Changement statut",
    icon: "🔄",
    color: "var(--warning-text)",
  },
  delete: { label: "Suppression", icon: "🗑️", color: "var(--danger)" },
  login: { label: "Connexion", icon: "🔐", color: "var(--text2)" },
  login_failed: {
    label: "Connexion échouée",
    icon: "⚠️",
    color: "var(--danger)",
  },
};

function formatDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityLogPanel() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState("");
  const LIMIT = 25;

  async function loadLogs(off = 0) {
    setLoading(true);
    const data = await api.getActivityLog(off, LIMIT);
    if (data) {
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setOffset(off);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = filter
    ? logs.filter(
        (l) =>
          l.username.toLowerCase().includes(filter.toLowerCase()) ||
          l.action.toLowerCase().includes(filter.toLowerCase()) ||
          (l.description || "").toLowerCase().includes(filter.toLowerCase()),
      )
    : logs;

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-header__title">Journal d'activité</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>
            {total} entrées
          </span>
          <button
            className="btn btn--sm btn--danger"
            onClick={async () => {
              if (
                !confirm(
                  "Purger tout le journal ? Cette action est irréversible.",
                )
              )
                return;
              await api.purgeActivityLog();
              loadLogs(0);
            }}
          >
            🗑️ Purger
          </button>
          <button className="btn btn--sm" onClick={() => loadLogs(offset)}>
            ↺ Actualiser
          </button>
        </div>
      </div>

      {/* Filtre */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Filtrer par utilisateur, action, description..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 11px",
            border: "0.5px solid var(--border2)",
            borderRadius: 8,
            background: "var(--surface2)",
            color: "var(--text)",
            fontSize: 13,
          }}
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="empty">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">Aucune activité enregistrée.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((log) => {
            const cfg = ACTION_CONFIG[log.action] || {
              label: log.action,
              icon: "•",
              color: "var(--text2)",
            };
            return (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "10px 12px",
                  background: "var(--surface2)",
                  borderRadius: 8,
                  borderLeft: `3px solid ${cfg.color}`,
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                  {cfg.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: cfg.color,
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text2)",
                      marginTop: 2,
                    }}
                  >
                    Par <strong>{log.username}</strong>
                    {log.entity_id && (
                      <span style={{ color: "var(--text3)" }}>
                        {" "}
                        · #{log.entity_id}
                      </span>
                    )}
                  </div>
                  {log.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text)",
                        marginTop: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      {log.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: "1rem",
          }}
        >
          <button
            className="btn btn--sm"
            disabled={offset === 0}
            onClick={() => loadLogs(Math.max(0, offset - LIMIT))}
          >
            ← Précédent
          </button>
          <span
            style={{ fontSize: 13, color: "var(--text2)", alignSelf: "center" }}
          >
            {Math.floor(offset / LIMIT) + 1} / {Math.ceil(total / LIMIT)}
          </span>
          <button
            className="btn btn--sm"
            disabled={offset + LIMIT >= total}
            onClick={() => loadLogs(offset + LIMIT)}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
