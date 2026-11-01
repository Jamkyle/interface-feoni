import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import AccessRequest from "../Components/AccessRequest";
import HistoryPanel from "../Components/HistoryPanel";
import { saveTraduction } from "../helpers/dbUtils";
import {
  COLLECTIONS,
  isValidNumber,
  toCantiqueId,
  parseCantiqueId,
} from "../helpers/checkUtils";

const EMPTY = { titre: "", cantique: "", trad: "" };

const FIELD_LABELS = { titre: "le titre", cantique: "le texte malgache", trad: "la traduction" };

const fromEntry = (entry) => ({
  titre: entry?.titre || "",
  cantique: entry?.strophe?.[0]?.cantique || "",
  trad: entry?.strophe?.[0]?.trad || "",
});

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "";

const EditorPage = ({
  cantiques,
  loading,
  loadError,
  user,
  canEdit,
  active,
  openId,
  onOpened,
  onDirtyChange,
}) => {
  const [collection, setCollection] = useState(COLLECTIONS[0]);
  const [numInput, setNumInput] = useState("");
  const [currentId, setCurrentId] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  // Version de la base sur laquelle porte la saisie (date_last_update)
  const [baseDate, setBaseDate] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [conflict, setConflict] = useState(false);

  const byId = useMemo(() => {
    const map = new Map();
    // En cas de doublon, on garde la première entrée (comportement historique)
    cantiques.forEach((c) => !map.has(String(c.id)) && map.set(String(c.id), c));
    return map;
  }, [cantiques]);

  const entry = currentId ? byId.get(currentId) : null;
  const remoteDate = entry?.date_last_update || "";
  const remoteChanged = Boolean(entry) && dirty && remoteDate !== baseDate;

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Données rafraîchies en temps réel tant qu'il n'y a pas de saisie en cours
  useEffect(() => {
    if (currentId && !dirty) {
      setDraft(fromEntry(entry));
      setBaseDate(entry?.date_last_update || "");
    }
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
      const target = byId.get(id);
      setCollection(parsed.collection);
      setNumInput(String(parsed.num));
      setCurrentId(id);
      setDraft(fromEntry(target));
      setBaseDate(target?.date_last_update || "");
      setDirty(false);
      setConflict(false);
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

  const save = async ({ force = false } = {}) => {
    if (!canEdit || !currentId || saving || !dirty) return;
    if (loading || loadError) {
      setMessage({
        type: "error",
        text: "La liste des cantiques n'est pas chargée : sauvegarde bloquée pour éviter un doublon",
      });
      return;
    }

    // Un champ qui avait du contenu et qui est maintenant vide
    const saved = fromEntry(entry);
    const emptied = Object.keys(FIELD_LABELS).filter(
      (field) => saved[field].trim() && !draft[field].trim()
    );
    if (
      emptied.length > 0 &&
      !window.confirm(
        `Vous allez effacer ${emptied.map((f) => FIELD_LABELS[f]).join(" et ")} du cantique ${currentId}. Continuer ?`
      )
    ) {
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await saveTraduction(
        {
          key: entry?.key,
          id: currentId,
          baseDate: force ? remoteDate : baseDate,
          ...draft,
        },
        user
      );
      setDirty(false);
      setConflict(false);
      setMessage({ type: "success", text: `Cantique ${currentId} sauvegardé` });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      if (error.code === "conflict") {
        setConflict(true);
        setMessage({
          type: "error",
          text: `${error.message} par quelqu'un d'autre. Rien n'a été écrasé.`,
        });
      } else {
        setMessage({
          type: "error",
          text:
            error.code === "PERMISSION_DENIED"
              ? "Sauvegarde refusée : ce compte n'a pas les droits d'écriture"
              : error.code === "exists" || error.code === "deleted"
              ? `${error.message}. Rien n'a été écrit.`
              : `La sauvegarde du cantique ${currentId} a échoué`,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setDraft(fromEntry(entry));
    setBaseDate(remoteDate);
    setDirty(false);
    setConflict(false);
    setMessage(null);
  };

  const forceSave = () => {
    if (
      window.confirm(
        "La version de la base sera remplacée par la vôtre (elle restera dans l'historique). Continuer ?"
      )
    ) {
      save({ force: true });
    }
  };

  const restore = (version) => {
    if (
      dirty &&
      !window.confirm("Remplacer votre saisie en cours par cette ancienne version ?")
    ) {
      return;
    }
    setDraft(fromEntry(version));
    setDirty(true);
    setMessage({
      type: "info",
      text: "Ancienne version chargée : vérifiez puis sauvegardez pour la rétablir.",
    });
  };

  // Ctrl/Cmd + S pour sauvegarder, seulement quand l'éditeur est affiché
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);

  const shown = currentId ? parseCantiqueId(currentId) : null;

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

      {loadError && (
        <p className="notice notice--error">
          Impossible de charger les cantiques. Rechargez la page avant de modifier quoi
          que ce soit.
        </p>
      )}

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
        <div className={`notice notice--${message.type}`}>
          <span>{message.text}</span>
          {conflict && (
            <span className="notice__actions">
              <button className="btn btn--small" onClick={discard}>
                Charger la version actuelle
              </button>
              <button className="btn btn--small btn--danger" onClick={forceSave}>
                Garder ma version
              </button>
            </span>
          )}
        </div>
      )}

      {canEdit && remoteChanged && !conflict && (
        <p className="notice notice--error">
          Ce cantique vient d'être modifié par quelqu'un d'autre pendant votre saisie.
          Sauvegarder vous demandera de choisir quelle version garder.
        </p>
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
              {shown.collection.name} {shown.num}
              {dirty && <span className="editor__dirty"> · modifié</span>}
            </h2>
            <span className="editor__meta">
              {entry
                ? remoteDate
                  ? `Dernière modification : ${formatDate(remoteDate)}`
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
              <HistoryPanel entryKey={entry?.key} onRestore={restore} />
              <button className="btn" onClick={discard} disabled={!dirty || saving}>
                Annuler les modifications
              </button>
              <button
                className="btn btn--primary"
                onClick={() => save()}
                disabled={!dirty || saving || loadError}
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
