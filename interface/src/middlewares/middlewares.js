const middlewares = (store) => (next) => (action) => {
  // console.log(action);
  if (action.type === "SET_ID") next(action);
  if (action.type === "SET_TITLE") next(action);

  if (action.type === "GET_CANTIQUE_TRADUCTION") {
    // console.log(action.id);
    let num;
    num = action.id.toString();
    let database = action.firebase.database();
    database
      .ref("/Traduction")
      .orderByChild("id")
      .equalTo(num)
      .once("value")
      .then((trad) => {
        let obj = trad.val();
        let key = JSON.stringify(obj).match(/(?:")(.*)(?:":{)/)[1];
        store.dispatch({ type: "SET_KEY", key: key });
        next({ type: "GET_TRAD_OK", trad: obj[key] });
      })
      .catch((e) => {
        next({ type: "GET_TRAD_FAIL" });
      });
  }

  if (action.type === "GET_LIST_CANTIQUE") {
    // console.log(action.id);
    let database = action.firebase.database();
    database
      .ref("/Traduction")
      .orderByChild("id")
      .on("value", (trad) => {
        let obj = [];
        trad.forEach((e) => {
          obj.push(e.val());
        });
        next({ type: "DO_LIST_CANTIQUES", list: obj });
      });
  }

  if (action.type === "SET_KEY" || action.type === "SET_CAT") {
    next(action);
  }

  if (action.type === "SET_DATA_TRAD") {
    next(action);
  }

  if (action.type === "SET_DATA_CANTIQUE") {
    next(action);
  }
};

export default middlewares;
