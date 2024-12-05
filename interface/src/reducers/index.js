import { combineReducers } from "redux";
import { firebaseReducer } from "react-redux-firebase";

const textTradReducers = (state = "", action) => {
  switch (action.type) {
    case "SET_DATA_TRAD":
      return action.data;
    default:
      return state;
  }
};

const cantiquesReducers = (state = "", action) => {
  switch (action.type) {
    case "SET_DATA_CANTIQUE":
      return action.data;
    default:
      return state;
  }
};

const trad = (state = {}, action) => {
  switch (action.type) {
    case "GET_TRAD_OK":
      return action.trad;
    case "GET_TRAD_FAIL":
      return { strophe: [{ trad: "", cantique: "" }] };
    default:
      return state;
  }
};

const key = (state = "", action) => {
  return action.type === "SET_KEY" ? action.key : state;
};

const listCantiques = (state = [], action) => {
  return action.type === "DO_LIST_CANTIQUES" ? action.list : state;
};

const categories = (state = "", action) => {
  let cat = state;
  switch (action.cat) {
    case "TSANTA":
      cat = "TS";
      break;
    case "ANTEMA":
      cat = "AN";
      break;
    case "FF":
      cat = "FF";
      break;
    default:
      cat = "";
  }
  return action.type === "SET_CAT" ? cat : state;
};

const setId = (state = "", action) => {
  switch (action.type) {
    case "SET_ID":
      return action.id;
    default:
      return state;
  }
};

const setTitle = (state = {}, action) => {
  switch (action.type) {
    case "SET_TITLE":
      return action.title;
    default:
      return state;
  }
};

const reducers = {
  data: {},
  categories: categories,
  title: setTitle,
  tradData: textTradReducers,
  cantiqueData: cantiquesReducers,
  trad,
  keyData: key,
  id: setId,
  listCantiques,
  firebase: firebaseReducer,
};

export default combineReducers(reducers);
