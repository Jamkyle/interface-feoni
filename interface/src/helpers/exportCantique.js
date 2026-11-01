import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Export des cantiques dans un ZIP : un fichier .txt par cantique
 * (texte malgache puis traduction).
 */
export const exportCantiquesToZip = async (cantiques) => {
  const zip = new JSZip();
  for (const { id, strophe } of cantiques) {
    if (strophe && strophe[0]) {
      const { cantique: malgache, trad: francais } = strophe[0];
      zip.file(`${id}.txt`, `${malgache || ""}\n\n${francais || ""}`);
    }
  }
  const zipContent = await zip.generateAsync({ type: "blob" });
  saveAs(zipContent, "cantiques.zip");
};

/**
 * Transforme une saisie en liste d'ids.
 * "300,304,TS2" -> ["300", "304", "TS2"] ; "300-310" -> ["300", ..., "310"]
 * Les intervalles acceptent un préfixe commun : "TS1-TS5".
 */
export const parseIds = (input) => {
  const ids = [];
  for (const part of input.split(",").map((p) => p.trim()).filter(Boolean)) {
    const range = part.match(/^([A-Za-z]*)(\d+)\s*-\s*\1?(\d+)$/);
    if (range) {
      const [, prefix, start, end] = range;
      const from = Number(start);
      const to = Number(end);
      if (from > to) throw new Error(`Intervalle invalide : ${part}`);
      for (let n = from; n <= to; n++) ids.push(`${prefix.toUpperCase()}${n}`);
    } else if (/^[A-Za-z]*\d+$/.test(part)) {
      ids.push(part.toUpperCase().replace(/^([A-Z]*)0*(\d)/, "$1$2"));
    } else {
      throw new Error(`Numéro invalide : ${part}`);
    }
  }
  return ids;
};
