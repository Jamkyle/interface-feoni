import { ref, push, update } from "firebase/database";
import { db } from "../store/firebase";

// Crée ou met à jour un cantique dans /Traduction (réservé aux admins par les règles)
export const saveTraduction = async ({ key, id, titre, cantique, trad }) => {
  const data = {
    titre,
    strophe: [{ cantique, trad }],
    date_last_update: new Date().toISOString(),
  };

  if (key) {
    await update(ref(db, `/Traduction/${key}`), data);
    return key;
  }
  const created = await push(ref(db, "/Traduction"), { id, ...data });
  return created.key;
};
