export const normalizeCantique = (data) => {
  const result = data && Object.values(data)[0];
  // const strophesOriginal = stropheStringToArray(result.strophe[0].cantique);
  // const strophesTrad = stropheStringToArray(result.strophe[0].trad);
  result.strophe = {
    original: result.strophe[0].cantique,
    trad: result.strophe[0].trad,
  };
  return result;
};

export const stropheStringToArray = (data) =>
  data
    .split(/(\n\n\d\.)|(\d\.)/g)
    .filter((it) => !(!it || it.match(/(\d\.)/g) || it === ""));
