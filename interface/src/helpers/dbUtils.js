import {
  ref,
  push,
  get,
  query,
  orderByChild,
  equalTo,
  runTransaction,
  serverTimestamp,
} from "firebase/database";
import { db } from "../store/firebase";

export class SaveError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Copie de la version précédente dans /TraductionHistory/{key} (ajout seulement)
const archive = (key, previous, user) =>
  push(ref(db, `/TraductionHistory/${key}`), {
    titre: previous.titre || "",
    strophe: previous.strophe || [],
    date_last_update: previous.date_last_update || "",
    saved_by: user?.email || "",
    saved_at: serverTimestamp(),
  });

/**
 * Crée ou met à jour un cantique dans /Traduction (réservé aux admins par les règles).
 * - Mise à jour : refusée (code "conflict") si le cantique a été modifié depuis
 *   son ouverture (baseDate), l'ancienne version est archivée avant l'écriture.
 * - Création : refusée (code "exists") si un cantique avec cet id existe déjà.
 */
export const saveTraduction = async (
  { key, id, baseDate, titre, cantique, trad },
  user
) => {
  const data = {
    titre,
    strophe: [{ cantique, trad }],
    date_last_update: new Date().toISOString(),
  };

  if (!key) {
    const existing = await get(
      query(ref(db, "/Traduction"), orderByChild("id"), equalTo(String(id)))
    );
    if (existing.exists()) {
      throw new SaveError("exists", `Le cantique ${id} existe déjà dans la base`);
    }
    const created = await push(ref(db, "/Traduction"), { id, ...data });
    return created.key;
  }

  const target = ref(db, `/Traduction/${key}`);
  const current = await get(target);
  if (!current.exists()) {
    throw new SaveError("deleted", `Le cantique ${id} n'existe plus dans la base`);
  }
  if ((current.val().date_last_update || "") !== (baseDate || "")) {
    throw new SaveError("conflict", `Le cantique ${id} a été modifié entre-temps`);
  }

  await archive(key, current.val(), user);

  // Vérification atomique : rien n'a changé entre la lecture et l'écriture
  const result = await runTransaction(target, (value) => {
    if (value === null) return value; // cache vide : le serveur renverra la vraie valeur
    if ((value.date_last_update || "") !== (baseDate || "")) return undefined;
    return { ...value, ...data };
  });
  if (!result.committed) {
    throw new SaveError("conflict", `Le cantique ${id} a été modifié entre-temps`);
  }
  if (!result.snapshot.exists()) {
    throw new SaveError("deleted", `Le cantique ${id} n'existe plus dans la base`);
  }
  return key;
};
