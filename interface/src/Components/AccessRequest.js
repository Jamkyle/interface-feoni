import React, { useState, useEffect } from "react";
import { ref, onValue, set, remove, serverTimestamp } from "firebase/database";
import { db } from "../store/firebase";

// Demande d'accès admin pour un utilisateur connecté qui n'est pas encore admin
const AccessRequest = ({ user }) => {
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onValue(
        ref(db, `/adminRequests/${user.uid}`),
        (snapshot) => setRequest(snapshot.val()),
        (err) => console.error("Erreur lors de la lecture de la demande :", err)
      ),
    [user.uid]
  );

  const sendRequest = async () => {
    setError("");
    try {
      await set(ref(db, `/adminRequests/${user.uid}`), {
        email: user.email,
        name: (user.displayName || "").slice(0, 100),
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi de la demande :", err);
      setError("La demande n'a pas pu être envoyée");
    }
  };

  const cancelRequest = () => remove(ref(db, `/adminRequests/${user.uid}`));

  return (
    <span className="access-request">
      {request ? (
        <>
          <span>Demande d'accès en attente</span>
          <button onClick={cancelRequest}>Annuler la demande</button>
        </>
      ) : (
        <button onClick={sendRequest}>Demander l'accès en écriture</button>
      )}
      {error && <span style={{ color: "#F33" }}>{error}</span>}
    </span>
  );
};

export default AccessRequest;
