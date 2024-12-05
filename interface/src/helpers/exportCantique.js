import JSZip from "jszip";
import { saveAs } from "file-saver";
import { fetchCantiquesInRange, getCantiqueByIds } from "./dbUtils";

/**
 * Export multiple cantiques to a ZIP file with only strophes (cantique and trad).
 * @param {Array} cantiques - Array of cantiques with their translations.
 * Each cantique object should have { id, strophe }.
 */
export const exportCantiquesToZip = async (cantiques) => {
  const zip = new JSZip();
  console.log('cantiques', cantiques)
  for (const cantique of cantiques) {
    const { id, strophe } = cantique;

    if (strophe && strophe[0]) {
      const { cantique: malgache, trad: francais } = strophe[0];

      // Contenu du fichier : strophes uniquement
      const fileContent = `${malgache || ""}\n\n${francais || ""}`;
      zip.file(`${id}.txt`, fileContent); // Ajouter un fichier pour chaque cantique
    }
  }

  try {
    const zipContent = await zip.generateAsync({ type: "blob" });
    saveAs(zipContent, "cantiques.zip"); // Télécharger le fichier ZIP
    console.log("Export réussi !");
  } catch (error) {
    console.error("Erreur lors de l'export :", error);
  }
};

export const getCantiqueAndExport = async (ids) => {
  let cantiques = [];
  console.log('ids', ids)
  try {
    if (ids.includes(",")) {
      // Cas d'une liste d'IDs séparés par des virgules
      const idsToFetch = ids.split(",").map((id) => id.trim()); // Découpe et nettoie
      cantiques = await getCantiqueByIds(idsToFetch);
    } else if (ids.includes("-")) {
      // Cas d'une plage d'IDs séparée par un tiret
      const [startId, endId] = ids
        .split("-")
        .map((id) => parseInt(id.trim(), 10)); // Découpe et convertit en nombres
      if (!isNaN(startId) && !isNaN(endId) && startId <= endId) {
        cantiques = await fetchCantiquesInRange(startId, endId);
        console.log('cantiques', cantiques)
      } else {
        console.error(
          "Intervalle invalide. Assurez-vous que startId <= endId."
        );
        return;
      }
    } else {
      // Cas d'un seul ID
      cantiques = await getCantiqueByIds([ids]);
    }

    if (cantiques.length > 0) {
      await exportCantiquesToZip(cantiques); // Exporter les cantiques
    } else {
      console.log("Aucun cantique à exporter.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération ou de l'export :", error);
  }
};
