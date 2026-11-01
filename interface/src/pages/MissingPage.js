import React, { useMemo } from "react";
import { FFPM_MAX, hasTranslation } from "../helpers/checkUtils";

// Cantiques FFPM (1 à FFPM_MAX) sans traduction française
const MissingPage = ({ cantiques, loading, onOpen }) => {
  const { missing, translated } = useMemo(() => {
    const done = new Set(
      cantiques.filter(hasTranslation).map((c) => String(c.id))
    );
    const all = Array.from({ length: FFPM_MAX }, (_, i) => String(i + 1));
    return {
      missing: all.filter((id) => !done.has(id)),
      translated: all.length - all.filter((id) => !done.has(id)).length,
    };
  }, [cantiques]);

  if (loading) return <div className="card">Chargement des cantiques…</div>;

  const percent = Math.round((translated / FFPM_MAX) * 100);

  return (
    <section className="card">
      <h2>FFPM sans traduction ({missing.length})</h2>
      <div className="progress" aria-label={`${percent} % traduits`}>
        <div className="progress__bar" style={{ width: `${percent}%` }} />
      </div>
      <p className="muted">
        {translated} / {FFPM_MAX} cantiques traduits ({percent} %). Cliquez sur un
        numéro pour l'ouvrir dans l'éditeur.
      </p>
      <div className="chips">
        {missing.map((id) => (
          <button key={id} className="chip" onClick={() => onOpen(id)}>
            {id}
          </button>
        ))}
      </div>
    </section>
  );
};

export default MissingPage;
