import React from "react";
import ReactDOM from "react-dom";
import { configureStore } from '@reduxjs/toolkit';
import "./index.css";

import { Provider } from "react-redux";
import reducers from "./reducers";
import middlewares from "./middlewares/middlewares";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import { ReactReduxFirebaseProvider } from "react-redux-firebase";
import { getFirebase } from "react-redux-firebase";

import { app as firebaseApp } from './store/firebase'; // Assurez-vous que ce fichier exporte bien `firebaseApp`

// Configuration de react-redux-firebase
const rrfConfig = {
  userProfile: 'users', // Stockage des profils utilisateur dans /users
};

// Création du store Redux
const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { getFirebase },
      },
    }).concat(middlewares),
});

// Props pour ReactReduxFirebaseProvider
const rrfProps = {
  firebase: firebaseApp,
  config: rrfConfig,
  dispatch: store.dispatch,
};

ReactDOM.render(
  <Provider store={store}>
    <ReactReduxFirebaseProvider {...rrfProps}>
      <App />
    </ReactReduxFirebaseProvider>
  </Provider>,
  document.getElementById("root")
);

// Service worker (optionnel)
serviceWorker.unregister();
