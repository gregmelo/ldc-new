import { useState, useEffect } from "react";
import { useInterventionStore } from "../../store";
import Modal from "../ui/Modal";
import { STATUS_OPTIONS } from "../ui/StatusBadge";
import RichTextEditor from '../ui/RichTextEditor'

export default function InterventionEditModal({ intervention, onClose }) {
  const update = useInterventionStore((s) => s.update);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (intervention) {
      setForm({
        date: (intervention.date || "").split("T")[0],
        date_fin: intervention.date_fin
          ? intervention.date_fin.split("T")[0]
          : new Date().toISOString().split("T")[0],
        nom: intervention.nom || "",
        type: intervention.type || "",
        duree: intervention.duree || "",
        sujet: intervention.sujet || "",
        notes: intervention.notes || "",
        status: intervention.status || "en_cours",
      });
      setStatus(null);
    }
  }, [intervention]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function selectType(type) {
    set("type", type);
    if (type !== "visio") set("duree", "");
  }

  async function handleSave() {
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
    const result = await update(intervention.id, payload);
    setLoading(false);
    if (result?.success) {
      setStatus("success");
      setTimeout(() => onClose(), 1000);
    } else {
      setStatus("error");
    }
  }

  if (!intervention || !form) return null;

  return (
    <Modal
      open={!!intervention}
      onClose={onClose}
      title="Modifier l'intervention"
    >
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
          <label>Date de fin</label>
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
          <label>Notes</label>
          <RichTextEditor value={form.notes} onChange={(val) => set('notes', val)} />
        </div>
      </div>

      {status === "success" && (
        <div className="alert alert--success">✓ Intervention mise à jour !</div>
      )}
      {status === "error" && (
        <div className="alert alert--error">Erreur lors de la mise à jour.</div>
      )}

      <button
        className="btn btn--primary"
        onClick={handleSave}
        disabled={loading}
        style={{ marginTop: status ? 8 : 14 }}
      >
        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </Modal>
  );
}
