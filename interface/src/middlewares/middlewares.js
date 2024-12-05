import { db } from "../store/firebase";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  get,
  onValue,
} from "firebase/database";

const middlewares = (store) => (next) => async (action) => {
  switch (action.type) {
    case "SET_ID":
    case "SET_TITLE":
    case "SET_KEY":
    case "SET_CAT":
    case "SET_DATA_TRAD":
    case "SET_DATA_CANTIQUE":
      next(action);
      break;

    case "GET_CANTIQUE_TRADUCTION":
      try {
        const num = action.id.toString();
        const databaseRef = query(
          ref(db, "/Traduction"),
          orderByChild("id"),
          equalTo(num)
        );
        const snapshot = await get(databaseRef);

        if (snapshot.exists()) {
          const obj = snapshot.val();
          const key = Object.keys(obj)[0]; // Récupère la première clé
          const trad = obj[key];
          console.log(trad)

          store.dispatch({ type: "SET_KEY", key });
          next({ type: "GET_TRAD_OK", trad });
        } else {
          next({ type: "GET_TRAD_FAIL" });
        }
      } catch (error) {
        console.error("Error fetching cantique traduction:", error);
        next({ type: "GET_TRAD_FAIL" });
      }
      break;

    case "GET_LIST_CANTIQUE":
      try {
        const databaseRef = query(ref(db, "/Traduction"), orderByChild("id"));
        onValue(databaseRef, (snapshot) => {
          const obj = [];
          snapshot.forEach((childSnapshot) => {
            obj.push(childSnapshot.val());
          });

          next({ type: "DO_LIST_CANTIQUES", list: obj });
        });
      } catch (error) {
        console.error("Error fetching list of cantiques:", error);
        next({ type: "DO_LIST_CANTIQUES_FAIL" });
      }
      break;

    default:
      next(action);
  }
};

export default middlewares;
