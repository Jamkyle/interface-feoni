import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import reducers from "./reducers";
import middlewares from "./middlewares/middlewares";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { reactReduxFirebase } from "react-redux-firebase";
import firebase from "firebase";
import firebaseJson from "./config.json";

const firebaseConfig = firebaseJson;

// const firebaseConfig = {
//   apiKey: "AIzaSyD5VsOspNrkr7konEZwV6XYVWBRNhFWWBs",
//   authDomain: "hiraapp-e0dac.firebaseapp.com",
//   databaseURL: "https://hiraapp-e0dac.firebaseio.com"
// }

firebase.initializeApp(firebaseConfig);

export const db = firebase.database();

const config = {
  userProfile: "users", // firebase root where user profiles are stored
  enableLogging: false, // enable/disable Firebase's database logging
};

const createStoreWithFirebase = compose(
  reactReduxFirebase(firebase, config),
  applyMiddleware(middlewares)
)(createStore);

const store = createStoreWithFirebase(reducers);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
