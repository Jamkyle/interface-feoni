import { useState, useEffect } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../store/firebase";

// Session Firebase + statut admin (/admins/{uid}), écouté en temps réel
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Erreur de connexion :", error);
      setAuthError(`La connexion a échoué (${error.code})`);
    });
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    return onValue(
      ref(db, `/admins/${user.uid}`),
      (snapshot) => setIsAdmin(snapshot.val() === true),
      (error) => {
        console.error("Erreur lors de la vérification admin :", error);
        setIsAdmin(false);
      }
    );
  }, [user]);

  return { user, ready, isAdmin, authError, setAuthError };
};

export default useAuth;
