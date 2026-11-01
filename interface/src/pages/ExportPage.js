import React, { useState } from "react";
import { exportCantiquesToZip, parseIds } from "../helpers/exportCantique";

const ExportPage = ({ cantiques }) => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    let ids;
    try {
      ids = parseIds(input);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    if (ids.length === 0) return;

    const wanted = new Set(ids);
    const found = cantiques.filter((c) => wanted.has(String(c.id)));
    if (found.length === 0) {
      setMessage({ type: "error", text: "Aucun de ces cantiques n'est dans la base" });
      return;
    }

    setBusy(true);
    try {
      await exportCantiquesToZip(found);
      const missing = ids.length - new Set(found.map((c) => String(c.id))).size;
      setMessage({
        type: "success",
        text:
          `${found.length} cantique(s) exporté(s) dans cantiques.zip` +
          (missing > 0 ? ` · ${missing} introuvable(s)` : ""),
      });
    } catch (error) {
      console.error("Erreur lors de l'export :", error);
      setMessage({ type: "error", text: "L'export a échoué" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card">
      <h2>Exporter des cantiques</h2>
      <p className="muted">
        Un fichier .txt par cantique (texte malgache puis traduction), regroupés
        dans un ZIP.
      </p>
      <form className="export__form" onSubmit={submit}>
        <input
          placeholder="ex. 300,304,800 ou 300-310 ou TS1-TS5"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn--primary" disabled={busy || !input.trim()}>
          {busy ? "Export…" : "Exporter"}
        </button>
      </form>
      <ul className="muted export__help">
        <li>Plusieurs numéros séparés par des virgules : 300,304,800</li>
        <li>Un intervalle avec un tiret : 300-310</li>
        <li>ANTEMA et TSANTA avec leur préfixe : AN3, TS1-TS5</li>
      </ul>
      {message && <p className={`notice notice--${message.type}`}>{message.text}</p>}
    </section>
  );
};

export default ExportPage;
