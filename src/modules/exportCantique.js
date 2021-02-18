import { db } from "../index";
import { normalizeCantique, stropheStringToArray } from "../helpers";

export default async (payload) => {
  let nums = [];
  if (payload.includes("-")) {
    const range = payload.split("-").sort((a, b) => a - b);
    for (let n = range[0]; n <= range[1]; n++) {
      nums.push(String(n));
    }
  } else {
    nums = nums.concat(payload.split(","));
  }

  const trads = await Promise.all(
    nums.map(async (num) => {
      const promiseData = await db
        .ref("/Traduction")
        .orderByChild("id")
        .equalTo(num)
        .once("value")
        .catch((e) => {
          throw Error("Error when trying to cantique", e);
        });
      return promiseData.val();
    })
  );
  for (let trad of trads) {
    const cantique = normalizeCantique(trad);
    if (cantique.strophe.trad) {
      const file = createDownloadFile(cantique.strophe);
      const element = document.createElement("a");
      element.href = fileLink(file);
      element.download = `${cantique.id}-cantique.txt`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      element.remove();
    }
  }
  // return strophes;
};

export const createDownloadFile = ({ original, trad }) => {
  const tradArr = stropheStringToArray(trad);
  const originalArr = stropheStringToArray(original);
  const constructCantiqueTxt = originalArr.map(
    (strophe, i) => `${i + 1}.\n${strophe}\n\n${tradArr[i]}`
  );
  return new Blob([constructCantiqueTxt.join("\n\n")], { type: "text/plain" });
};

export const fileLink = (file) => URL.createObjectURL(file);
