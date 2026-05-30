import { useState } from "react";
import { useInterventionStore } from "../../store";
import { STATUS_OPTIONS } from "../ui/StatusBadge";

const today = () => new Date().toISOString().split("T")[0];

export default function InterventionForm() {
  const create = useInterventionStore((s) => s.create);
  const [form, setForm] = useState({
    date: today(),
    date_fin: "",
    nom: "",
    type: "",
    duree: "",
    sujet: "",
    notes: "",
    status: "en_cours",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function selectType(type) {
    set("type", type);
    if (type !== "visio") set("duree", "");
  }

  async function handleSubmit() {
    if (!form.date || !form.nom || !form.type || !form.sujet) {
      alert("Merci de remplir la date, le nom, le type et le sujet.");
      return;
    }
    setLoading(true);
    setStatus(null);
    const payload = {
      ...form,
      duree: form.type === "visio" && form.duree ? parseInt(form.duree) : null,
    };
    const result = await create(payload);
    setLoading(false);
    if (result?.success) {
      setForm({
        date: today(),
        nom: "",
        type: "",
        duree: "",
        sujet: "",
        notes: "",
        status: "en_cours",
      });
      setStatus("success");
      setTimeout(() => setStatus(null), 2500);
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="card">
      <div className="form-grid">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Date de fin (optionnel)</label>
          <input
            type="date"
            value={form.date_fin}
            onChange={(e) => set("date_fin", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Volontaire aidé</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            placeholder="Ex : Jean-Luc"
          />
        </div>

        <div className="form-group form-group--full">
          <label>Type d'intervention</label>
          <div className="radio-group">
            <label
              className={`radio-label${form.type === "visio" ? " radio-label--selected" : ""}`}
              onClick={() => selectType("visio")}
            >
              📹 Visio / appel
            </label>
            <label
              className={`radio-label${form.type === "message" ? " radio-label--selected" : ""}`}
              onClick={() => selectType("message")}
            >
              💬 Message
            </label>
          </div>
        </div>

        {form.type === "visio" && (
          <div className="form-group">
            <label>Durée (minutes)</label>
            <input
              type="number"
              value={form.duree}
              onChange={(e) => set("duree", e.target.value)}
              min="1"
              placeholder="Ex : 30"
            />
          </div>
        )}

        <div className="form-group form-group--full">
          <label>Statut</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group form-group--full">
          <label>Sujet</label>
          <input
            type="text"
            value={form.sujet}
            onChange={(e) => set("sujet", e.target.value)}
            placeholder="Ex : Problème d'accès Teams"
          />
        </div>

        <div className="form-group form-group--full">
          <label>Notes (optionnel)</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Détails, solution apportée..."
          />
        </div>
      </div>

      <button
        className="btn btn--primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Enregistrement..." : "Enregistrer l'intervention"}
      </button>

      {status === "success" && (
        <div className="alert alert--success">✓ Intervention enregistrée !</div>
      )}
      {status === "error" && (
        <div className="alert alert--error">
          Erreur lors de l'enregistrement.
        </div>
      )}
    </div>
  );
}
