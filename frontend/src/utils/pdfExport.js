import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const STATUS_LABELS = {
  en_cours: "En cours",
  resolu: "Resolu",
  en_attente: "En attente retour",
  annule: "Annule",
  envoye_support: "Support Bethel",
};

function decodeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"');
}

function getQuarter(dateStr) {
  const d = (dateStr || "").split("T")[0];
  const parts = d.split("-");
  return { year: parseInt(parts[0]), q: Math.ceil(parseInt(parts[1]) / 3) };
}

function formatDate(d) {
  if (!d) return "";
  const s = (d + "").split("T")[0].split("-");
  return `${s[2]}/${s[1]}/${s[0]}`;
}

export async function exportRapportPDF(
  interventions,
  selectedQ,
  chartElementIds = []
) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 15;
  const contentW = W - margin * 2;
  let y = margin;

  const primary   = [24, 95, 165];
  const dark      = [26, 26, 24];
  const gray      = [95, 94, 90];
  const lightGray = [240, 239, 235];
  const white     = [255, 255, 255];

  // ---- En-tete ----
  pdf.setFillColor(...primary);
  pdf.rect(0, 0, W, 28, "F");

  pdf.setTextColor(...white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Suivi Interventions LDC", margin, 12);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Rapport trimestriel - " + selectedQ, margin, 20);

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  pdf.text("Genere le " + today, W - margin, 20, { align: "right" });

  y = 38;

  // ---- Donnees du trimestre ----
  const parts = selectedQ.split(" ");
  const qLabel = parts[0];
  const qYear  = parseInt(parts[1]);
  const qNum   = parseInt(qLabel.replace("T", ""));

  const rows = interventions.filter((r) => {
    const q = getQuarter(r.date);
    return q.year === qYear && q.q === qNum;
  });

  const visios   = rows.filter((r) => r.type === "visio");
  const msgs     = rows.filter((r) => r.type === "message");
  const totalMin = visios.reduce((s, r) => s + (parseInt(r.duree) || 0), 0);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  // ---- Metriques ----
  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Chiffres cles", margin, y);
  y += 6;

  const boxW = (contentW - 9) / 4;
  const metrics = [
    { label: "Total", value: rows.length },
    { label: "Visios / appels", value: visios.length },
    { label: "Aides message", value: msgs.length },
    { label: "Temps visio", value: `${h > 0 ? h + "h " : ""}${m}min` },
  ];

  metrics.forEach((metric, i) => {
    const x = margin + i * (boxW + 3);
    pdf.setFillColor(...lightGray);
    pdf.roundedRect(x, y, boxW, 18, 2, 2, "F");
    pdf.setTextColor(...gray);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(metric.label, x + boxW / 2, y + 6, { align: "center" });
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(String(metric.value), x + boxW / 2, y + 14, { align: "center" });
  });

  y += 24;

  // ---- Stats par statut ----
  const statusCounts = {};
  rows.forEach((r) => {
    const s = r.status || "en_cours";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  if (Object.keys(statusCounts).length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...dark);
    pdf.text("Repartition par statut", margin, y);
    y += 6;

    Object.entries(statusCounts).forEach(([status, count]) => {
      const pct  = Math.round((count / rows.length) * 100);
      const barW = (contentW - 40) * (pct / 100);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...gray);
      pdf.text(STATUS_LABELS[status] || status, margin, y + 3);

      pdf.setFillColor(...lightGray);
      pdf.roundedRect(margin + 55, y - 2, contentW - 40, 6, 1, 1, "F");
      pdf.setFillColor(...primary);
      if (barW > 0) pdf.roundedRect(margin + 55, y - 2, barW, 6, 1, 1, "F");

      pdf.setTextColor(...dark);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${count} (${pct}%)`, W - margin, y + 3, { align: "right" });

      y += 9;
    });
    y += 4;
  }

  // ---- Graphiques depuis le DOM ----
  if (chartElementIds.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...dark);
    // pdf.text("Graphiques", margin, y);
    y += 4;

    for (const id of chartElementIds) {
      const el = document.getElementById(id);
      if (!el) continue;

      try {
        const canvas = await html2canvas(el, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");
        const imgW = contentW;
        const imgH = (canvas.height / canvas.width) * imgW;

        if (y + imgH > 270) { pdf.addPage(); y = margin; }

        pdf.addImage(imgData, "PNG", margin, y, imgW, imgH);
        y += imgH + 6;
      } catch (e) {
        console.warn("Impossible de capturer le graphique", id, e);
      }
    }
  }

  // ---- Top volontaires ----
  const byPerson = {};
  rows.forEach((r) => {
    const nom = decodeHtml(r.nom || "");
    byPerson[nom] = (byPerson[nom] || 0) + 1;
  });
  const top = Object.entries(byPerson)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (top.length > 0) {
    if (y > 230) { pdf.addPage(); y = margin; }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...dark);
    pdf.text("Top volontaires", margin, y);
    y += 6;

    top.forEach(([nom, count], i) => {
      const rowBg = i % 2 === 0 ? white : lightGray;
      pdf.setFillColor(...rowBg);
      pdf.rect(margin, y - 3, contentW, 8, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...dark);
      pdf.text(`${i + 1}. ${nom}`, margin + 2, y + 2);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        String(count) + " intervention" + (count > 1 ? "s" : ""),
        W - margin, y + 2, { align: "right" }
      );
      y += 8;
    });
    y += 4;
  }

  // ---- Tableau detaille ----
  if (rows.length > 0) {
    if (y > 220) { pdf.addPage(); y = margin; }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...dark);
    pdf.text("Detail des interventions", margin, y);
    y += 6;

    pdf.setFillColor(...primary);
    pdf.rect(margin, y - 3, contentW, 8, "F");
    pdf.setTextColor(...white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("Date",       margin + 2,   y + 2);
    pdf.text("Volontaire", margin + 22,  y + 2);
    pdf.text("Type",       margin + 70,  y + 2);
    pdf.text("Statut",     margin + 90,  y + 2);
    pdf.text("Sujet",      margin + 125, y + 2);
    y += 8;

    rows.forEach((row, i) => {
      if (y > 270) { pdf.addPage(); y = margin; }

      const rowBg = i % 2 === 0 ? white : lightGray;
      pdf.setFillColor(...rowBg);
      pdf.rect(margin, y - 3, contentW, 7, "F");

      pdf.setTextColor(...dark);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);

      pdf.text(formatDate(row.date), margin + 2, y + 1);
      pdf.text(decodeHtml(row.nom || "").substring(0, 18), margin + 22, y + 1);
      pdf.text(row.type === "visio" ? "Visio" : "Message", margin + 70, y + 1);
      pdf.text(STATUS_LABELS[row.status] || row.status || "", margin + 90, y + 1);
      pdf.text(decodeHtml(row.sujet || "").substring(0, 30), margin + 125, y + 1);
      y += 7;
    });
  }

  // ---- Pied de page ----
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFillColor(...lightGray);
    pdf.rect(0, 288, W, 9, "F");
    pdf.setTextColor(...gray);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Suivi Interventions LDC - " + selectedQ, margin, 294);
    pdf.text(`Page ${i} / ${pageCount}`, W - margin, 294, { align: "right" });
  }

  pdf.save(`rapport-ldc-${selectedQ.replace(" ", "-")}.pdf`);
}