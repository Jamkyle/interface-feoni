import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../store/firebase";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
    : "date inconnue";

// Versions précédentes d'un cantique (/TraductionHistory/{key}), lisibles par les admins
const HistoryPanel = ({ entryKey, onRestore }) => {
  const [versions, setVersions] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!entryKey) return;
    return onValue(
      ref(db, `/TraductionHistory/${entryKey}`),
      (snapshot) => {
        const list = [];
        snapshot.forEach((child) => {
          list.push({ id: child.key, ...child.val() });
        });
        setVersions(list.reverse());
      },
      (error) => console.error("Erreur lors du chargement de l'historique :", error)
    );
  }, [entryKey]);

  if (!entryKey) return null;

  return (
    <div className="history">
      <button className="btn btn--small" onClick={() => setOpen((prev) => !prev)}>
        {open ? "Masquer" : "Afficher"} l'historique ({versions.length})
      </button>
      {open && (
        <ul className="history__list">
          {versions.length === 0 && (
            <li className="muted">Aucune version précédente enregistrée.</li>
          )}
          {versions.map((version) => (
            <li key={version.id}>
              <span>
                Version du {formatDate(version.date_last_update)}
                <small className="muted">
                  {" "}
                  · remplacée le {formatDate(version.saved_at)}
                  {version.saved_by && ` par ${version.saved_by}`}
                </small>
              </span>
              <button className="btn btn--small" onClick={() => onRestore(version)}>
                Charger dans l'éditeur
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPanel;
