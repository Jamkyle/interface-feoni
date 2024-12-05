import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getCantiqueByIds } from "./dbUtils";

/**
 * Export multiple cantiques to a ZIP file with only strophes (cantique and trad).
 * @param {Array} cantiques - Array of cantiques with their translations.
 * Each cantique object should have { id, strophe }.
 */
export const exportCantiquesToZip = async (cantiques) => {
  const zip = new JSZip();
  for (const cantique of Object.values(cantiques)) {
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
  const idsToFetch = ids.indexOf(",") !== -1 ? ids.split(",") : [ids];
  const cantiques = await getCantiqueByIds(idsToFetch);
  exportCantiquesToZip(cantiques);
};
