import { useEffect, useState } from "react";
import { useInterventionStore, useAuthStore } from "../../store";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, PointElement, LineElement,
);

function getQuarter(dateStr) {
  const d = (dateStr || "").split("T")[0];
  const parts = d.split("-");
  return { year: parseInt(parts[0]), q: Math.ceil(parseInt(parts[1]) / 3) };
}

function getCurrentAndPrevQuarter() {
  const now = new Date();
  const y = now.getFullYear();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  const prevQ = q === 1 ? 4 : q - 1;
  const prevY = q === 1 ? y - 1 : y;
  return { cur: { year: y, q }, prev: { year: prevY, q: prevQ } };
}

function pct(cur, prev) {
  if (prev === 0) return cur > 0 ? "+100%" : "—";
  const diff = Math.round(((cur - prev) / prev) * 100);
  return diff >= 0 ? `+${diff}%` : `${diff}%`;
}

function pctColor(cur, prev) {
  if (prev === 0) return "var(--text3)";
  return cur >= prev ? "var(--success-text)" : "var(--danger)";
}

export default function Dashboard() {
  const { interventions, fetch } = useInterventionStore();
  const currentUser = useAuthStore((s) => s.user);
  const [view, setView] = useState("global");

  useEffect(() => { fetch(); }, []);

  // Filtrage selon la vue
  const displayInterventions = view === "personal"
    ? interventions.filter((r) => r.nom === currentUser?.username)
    : interventions;

  const { cur, prev } = getCurrentAndPrevQuarter();

  const curRows  = displayInterventions.filter((r) => { const q = getQuarter(r.date); return q.year === cur.year && q.q === cur.q; });
  const prevRows = displayInterventions.filter((r) => { const q = getQuarter(r.date); return q.year === prev.year && q.q === prev.q; });

  const curTotal    = curRows.length;
  const prevTotal   = prevRows.length;
  const curResolu   = curRows.filter((r) => r.status === "resolu").length;
  const prevResolu  = prevRows.filter((r) => r.status === "resolu").length;
  const curEnCours  = curRows.filter((r) => r.status === "en_cours").length;
  const prevEnCours = prevRows.filter((r) => r.status === "en_cours").length;
  const curVisioMin = curRows.filter((r) => r.type === "visio").reduce((s, r) => s + (parseInt(r.duree) || 0), 0);
  const prevVisioMin= prevRows.filter((r) => r.type === "visio").reduce((s, r) => s + (parseInt(r.duree) || 0), 0);
  const curH = Math.floor(curVisioMin / 60);
  const curM = curVisioMin % 60;

  // Évolution mensuelle
  const monthLabels = [];
  const monthData   = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const count = displayInterventions.filter((r) => {
      const parts = (r.date || "").split("T")[0].split("-");
      return parseInt(parts[0]) === y && parseInt(parts[1]) === m;
    }).length;
    monthLabels.push(label);
    monthData.push(count);
  }

  // Répartition statut
  const statusLabels = ["En cours", "Résolu", "En attente", "Annulé", "Support Béthel"];
  const statusKeys   = ["en_cours", "resolu", "en_attente", "annule", "envoye_support"];
  const statusData   = statusKeys.map((k) => displayInterventions.filter((r) => (r.status || "en_cours") === k).length);
  const statusColors = ["#185FA5", "#085041", "#92400E", "#888780", "#5B21B6"];
  const statusBg     = ["#185FA5cc", "#085041cc", "#92400Ecc", "#888780cc", "#5B21B6cc"];

  // Top 5
  const byPerson = {};
  displayInterventions.forEach((r) => { byPerson[r.nom] = (byPerson[r.nom] || 0) + 1; });
  const top5 = Object.entries(byPerson).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#b4b2a9" : "#5f5e5a";

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { mode: "index" } },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
      y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom", labels: { color: textColor, font: { size: 12 }, padding: 12 } } },
    cutout: "65%",
  };

  const hbarOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 } },
      y: { grid: { display: false }, ticks: { color: textColor, font: { size: 12 } } },
    },
  };

  const quarterLabel = `T${cur.q} ${cur.year}`;
  const prevLabel    = `T${prev.q} ${prev.year}`;

  return (
    <div>
      {/* Toggle Global / Personnel */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 8, padding: 3, gap: 2 }}>
          <button
            className={`tab${view === "global" ? " active" : ""}`}
            style={{ flex: "none", padding: "6px 14px", fontSize: 13 }}
            onClick={() => setView("global")}
          >
            🌐 Global
          </button>
          <button
            className={`tab${view === "personal" ? " active" : ""}`}
            style={{ flex: "none", padding: "6px 14px", fontSize: 13 }}
            onClick={() => setView("personal")}
          >
            👤 Personnel
          </button>
        </div>
      </div>

      {/* Métriques */}
      <div className="metric-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <MetricCard label="Total interventions" value={curTotal} sub={`vs ${prevTotal} (${prevLabel})`} trend={pct(curTotal, prevTotal)} trendColor={pctColor(curTotal, prevTotal)} />
        <MetricCard label="Résolues" value={curResolu} sub={`vs ${prevResolu} (${prevLabel})`} trend={pct(curResolu, prevResolu)} trendColor={pctColor(curResolu, prevResolu)} />
        <MetricCard label="En cours" value={curEnCours} sub={`vs ${prevEnCours} (${prevLabel})`} trend={pct(curEnCours, prevEnCours)} trendColor={pctColor(curEnCours, prevEnCours)} />
        <MetricCard label="Temps en visio" value={`${curH > 0 ? curH + "h " : ""}${curM}min`} sub={`${prevVisioMin} min (${prevLabel})`} trend={pct(curVisioMin, prevVisioMin)} trendColor={pctColor(curVisioMin, prevVisioMin)} />
      </div>

      {/* Évolution mensuelle */}
      <div className="card" id="chart-evolution">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: "1rem" }}>
          Évolution des interventions (12 derniers mois)
          {view === "personal" && <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 8 }}>— {currentUser?.username}</span>}
        </div>
        <Bar
          data={{ labels: monthLabels, datasets: [{ label: "Interventions", data: monthData, backgroundColor: "#185FA5cc", borderColor: "#185FA5", borderWidth: 1, borderRadius: 4 }] }}
          options={barOptions}
        />
      </div>

      {/* Répartition statut + Top volontaires */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="card dashboard-grid" id="chart-status">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: "1rem" }}>Répartition par statut</div>
          {displayInterventions.length > 0 ? (
            <Doughnut
              data={{ labels: statusLabels, datasets: [{ data: statusData, backgroundColor: statusBg, borderColor: statusColors, borderWidth: 1.5 }] }}
              options={doughnutOptions}
            />
          ) : (
            <div className="empty">Aucune donnée</div>
          )}
        </div>

        <div className="card dashboard-grid" id="chart-top">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: "1rem" }}>
            {view === "personal" ? "Mes interventions récentes" : "Top 5 volontaires"}
          </div>
          {top5.length > 0 ? (
            <Bar
              data={{
                labels: top5.map(([n]) => n.length > 15 ? n.substring(0, 15) + "…" : n),
                datasets: [{ label: "Interventions", data: top5.map(([, c]) => c), backgroundColor: "#E1F5EEcc", borderColor: "#085041", borderWidth: 1, borderRadius: 4 }],
              }}
              options={hbarOptions}
            />
          ) : (
            <div className="empty">Aucune donnée</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, trend, trendColor }) {
  return (
    <div className="metric">
      <div className="metric__label">{label}</div>
      <div className="metric__value">{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>{sub}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: trendColor }}>{trend}</span>
      </div>
    </div>
  );
}