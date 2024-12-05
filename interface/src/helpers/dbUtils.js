import { ref, query, orderByChild, equalTo, get, update, startAt, endAt } from "firebase/database";
import { db } from "../store/firebase";

export const updateTrad = async (tradId, data) => {
  const dateLastUpdate = new Date().toISOString();

  try {
    // Étape 1 : Trouver la clé générée correspondant à trad.id
    const traductionsRef = query(
      ref(db, "/Traduction"),
      orderByChild("id"),
      equalTo(tradId.toString()) // Recherche par id
    );
    const snapshot = await get(traductionsRef);

    if (snapshot.exists()) {
      const dataObject = snapshot.val();
      const firebaseKey = Object.keys(dataObject)[0]; // Récupère la première clé générée par Firebase

      // Étape 2 : Effectuer la mise à jour en utilisant la clé générée par Firebase
      await update(ref(db, `/Traduction/${firebaseKey}`), {
        strophe: [data],
        date_last_update: dateLastUpdate,
      });

      console.log("Mise à jour réussie !");
      return true
    } else {
      console.error("Aucune entrée trouvée pour trad.id :", tradId);
      return false
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    return false
  }
};

export const getCantiqueByIds = async (ids) => {
  try {
    const cantiquesRef = ref(db, "/Traduction");
    const snapshot = await get(cantiquesRef);

    if (snapshot.exists()) {
      const allCantiques = snapshot.val();
      // Filtrer les cantiques par ids
      const filteredCantiques = Object.keys(allCantiques)
        .filter((key) => ids.includes(allCantiques[key].id))
        .reduce((result, key) => {
          result[key] = allCantiques[key];
          return result;
        }, {});

      return Object.values(filteredCantiques); // Convertir en tableau filteredCantiques;
    } else {
      console.error("Aucune entrée trouvée pour /Traduction");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    return null;
  }
};


export const fetchCantiquesInRange = async (startId, endId) => {
  try {
    // Référence vers le nœud Firebase contenant les cantiques
    const cantiquesRef = query(
      ref(db, "/Traduction"),
      orderByChild("id"), // Ordonner par le champ 'id'
      startAt(startId.toString()), // Commencer à l'ID de début
      endAt(endId.toString()) // Finir à l'ID de fin
    );

    const snapshot = await get(cantiquesRef);

    if (snapshot.exists()) {
      const cantiques = snapshot.val();
      return Object.values(cantiques); // Convertir en tableau
    } else {
      console.log(`Aucun cantique trouvé entre ${startId} et ${endId}.`);
      return [];
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des cantiques :", error);
    return [];
  }
};