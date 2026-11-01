import React, { useState, useEffect, useMemo, useCallback } from "react";
import AccessRequest from "../Components/AccessRequest";
import { saveTraduction } from "../helpers/dbUtils";
import {
  COLLECTIONS,
  isValidNumber,
  toCantiqueId,
  parseCantiqueId,
} from "../helpers/checkUtils";

const EMPTY = { titre: "", cantique: "", trad: "" };

const fromEntry = (entry) => ({
  titre: entry?.titre || "",
  cantique: entry?.strophe?.[0]?.cantique || "",
  trad: entry?.strophe?.[0]?.trad || "",
});

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "";

const EditorPage = ({ cantiques, loading, user, canEdit, openId, onOpened }) => {
  const [collection, setCollection] = useState(COLLECTIONS[0]);
  const [numInput, setNumInput] = useState("");
  const [currentId, setCurrentId] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const byId = useMemo(() => {
    const map = new Map();
    // En cas de doublon, on garde la première entrée (comportement historique)
    cantiques.forEach((c) => !map.has(String(c.id)) && map.set(String(c.id), c));
    return map;
  }, [cantiques]);

  const entry = currentId ? byId.get(currentId) : null;

  // Données rafraîchies en temps réel tant qu'il n'y a pas de saisie en cours
  useEffect(() => {
    if (currentId && !dirty) setDraft(fromEntry(entry));
  }, [currentId, entry, dirty]);

  // Prévenir avant de quitter la page avec des modifications non sauvegardées
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const open = useCallback(
    (id) => {
      if (
        dirty &&
        !window.confirm("Des modifications ne sont pas sauvegardées. Les abandonner ?")
      ) {
        return;
      }
      const parsed = parseCantiqueId(id);
      setCollection(parsed.collection);
      setNumInput(String(parsed.num));
      setCurrentId(id);
      setDraft(fromEntry(byId.get(id)));
      setDirty(false);
      setMessage(null);
    },
    [dirty, byId]
  );

  useEffect(() => {
    if (openId) {
      open(openId);
      onOpened();
    }
  }, [openId, open, onOpened]);

  const submitOpen = (e) => {
    e.preventDefault();
    if (!isValidNumber(collection, numInput)) {
      setMessage({
        type: "error",
        text: collection.max
          ? `Numéro invalide : ${collection.name} va de 1 à ${collection.max}`
          : "Numéro invalide",
      });
      return;
    }
    open(toCantiqueId(collection, numInput));
  };

  const step = (delta) => {
    const { collection: c, num } = parseCantiqueId(currentId);
    const next = num + delta;
    if (isValidNumber(c, next)) open(toCantiqueId(c, next));
  };

  const change = (field) => (e) => {
    setDraft((prev) => ({ ...prev, [field]: e.target.value }));
    setDirty(true);
    setMessage(null);
  };

  const save = async () => {
    if (!canEdit || !currentId || saving) return;
    setSaving(true);
    try {
      await saveTraduction({ key: entry?.key, id: currentId, ...draft });
      setDirty(false);
      setMessage({ type: "success", text: `Cantique ${currentId} sauvegardé` });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      setMessage({
        type: "error",
        text:
          error.code === "PERMISSION_DENIED"
            ? "Sauvegarde refusée : ce compte n'a pas les droits d'écriture"
            : `La sauvegarde du cantique ${currentId} a échoué`,
      });
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(fromEntry(entry));
    setDirty(false);
    setMessage(null);
  };

  // Ctrl/Cmd + S pour sauvegarder
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <section className="editor">
      <form className="card editor__search" onSubmit={submitOpen}>
        <select
          value={collection.name}
          onChange={(e) =>
            setCollection(COLLECTIONS.find((c) => c.name === e.target.value))
          }
        >
          {COLLECTIONS.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="editor__num"
          inputMode="numeric"
          placeholder="Numéro"
          value={numInput}
          onChange={(e) => setNumInput(e.target.value.replace(/\D/g, ""))}
        />
        <button type="submit" className="btn btn--primary" disabled={loading}>
          Ouvrir
        </button>
        {currentId && (
          <span className="editor__nav">
            <button type="button" className="btn btn--small" onClick={() => step(-1)}>
              ← Précédent
            </button>
            <button type="button" className="btn btn--small" onClick={() => step(1)}>
              Suivant →
            </button>
          </span>
        )}
      </form>

      {!canEdit && (
        <div className="notice notice--info">
          <span>
            Lecture seule : vous pouvez consulter les cantiques mais pas les modifier.
          </span>
          {user ? (
            <AccessRequest user={user} />
          ) : (
            <span>Connectez-vous pour demander un accès en écriture.</span>
          )}
        </div>
      )}

      {message && (
        <p className={`notice notice--${message.type}`}>{message.text}</p>
      )}

      {!currentId ? (
        <div className="card editor__empty">
          {loading
            ? "Chargement des cantiques…"
            : "Choisissez un recueil et un numéro pour afficher un cantique."}
        </div>
      ) : (
        <div className="card">
          <div className="editor__head">
            <h2>
              {parseCantiqueId(currentId).collection.name}{" "}
              {parseCantiqueId(currentId).num}
              {dirty && <span className="editor__dirty"> · modifié</span>}
            </h2>
            <span className="editor__meta">
              {entry
                ? entry.date_last_update
                  ? `Dernière modification : ${formatDate(entry.date_last_update)}`
                  : ""
                : "Pas encore dans la base"}
            </span>
          </div>

          <label className="field">
            Titre
            <input
              value={draft.titre}
              onChange={change("titre")}
              readOnly={!canEdit}
              placeholder={canEdit ? "Titre du cantique" : ""}
            />
          </label>

          <div className="editor__texts">
            <label className="field">
              Malgache
              <textarea
                value={draft.cantique}
                onChange={change("cantique")}
                readOnly={!canEdit}
                placeholder={canEdit ? "Texte en malgache" : "Aucun texte"}
              />
            </label>
            <label className="field">
              Français
              <textarea
                value={draft.trad}
                onChange={change("trad")}
                readOnly={!canEdit}
                placeholder={canEdit ? "Traduction en français" : "Pas encore traduit"}
              />
            </label>
          </div>

          {canEdit && (
            <div className="editor__actions">
              <button className="btn" onClick={cancel} disabled={!dirty || saving}>
                Annuler les modifications
              </button>
              <button
                className="btn btn--primary"
                onClick={save}
                disabled={!dirty || saving}
                title="Ctrl/Cmd + S"
              >
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default EditorPage;
