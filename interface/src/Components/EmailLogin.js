import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../store/firebase";

// Connexion par email / mot de passe (compte admin partagé)
const EmailLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError(
        err.code === "auth/invalid-credential" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/user-not-found"
          ? "Email ou mot de passe incorrect"
          : `La connexion a échoué (${err.code})`
      );
      setLoading(false);
    }
  };

  return (
    <form className="email-login" onSubmit={submit}>
      <input
        type="email"
        placeholder="Email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mot de passe"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        Se connecter
      </button>
      {error && <span style={{ color: "#F33" }}>{error}</span>}
    </form>
  );
};

export default EmailLogin;
