// Recueils : le préfixe est collé au numéro dans l'id stocké (ex. "TS12")
export const COLLECTIONS = [
  { name: "FFPM", prefix: "", max: 829 },
  { name: "ANTEMA", prefix: "AN" },
  { name: "TSANTA", prefix: "TS" },
];

export const FFPM_MAX = 829;

export const isValidNumber = (collection, num) => {
  const n = Number(num);
  if (!Number.isInteger(n) || n < 1) return false;
  return collection.max ? n <= collection.max : true;
};

export const toCantiqueId = (collection, num) =>
  `${collection.prefix}${Number(num)}`;

// "TS12" -> { collection: TSANTA, num: 12 }
export const parseCantiqueId = (id) => {
  const value = String(id);
  const collection =
    COLLECTIONS.find((c) => c.prefix && value.startsWith(c.prefix)) ||
    COLLECTIONS[0];
  return { collection, num: Number(value.slice(collection.prefix.length)) };
};

export const hasTranslation = (cantique) =>
  Boolean(cantique?.strophe?.[0]?.trad?.trim());
