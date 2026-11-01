import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth, googleProvider } from "../store/firebase";

const errorMessage = (error) => {
  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Email ou mot de passe incorrect";
    case "auth/too-many-requests":
      return "Trop de tentatives, réessayez dans quelques minutes";
    default:
      return `La connexion a échoué (${error.code})`;
  }
};

const LoginPage = ({ onGuest, authError }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginWithEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      // Popup bloquée par le navigateur : on bascule sur la redirection
      if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      if (err.code === "auth/popup-closed-by-user") return;
      console.error("Erreur de connexion :", err);
      setError(errorMessage(err));
    }
  };

  return (
    <div className="login">
      <div className="card login__card">
        <h1 className="login__title">Feoni</h1>
        <p className="login__subtitle">Interface de gestion des cantiques</p>

        <form className="login__form" onSubmit={loginWithEmail}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {(error || authError) && (
            <p className="notice notice--error">{error || authError}</p>
          )}
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <div className="login__divider">ou</div>

        <button className="btn btn--block" onClick={loginWithGoogle}>
          Continuer avec Google
        </button>
        <button className="btn btn--ghost btn--block" onClick={onGuest}>
          Consulter en lecture seule
        </button>
        <p className="login__hint">
          La lecture seule permet de consulter et d'exporter les cantiques, sans
          les modifier.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
