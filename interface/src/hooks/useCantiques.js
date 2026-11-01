import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../store/firebase";

// Liste complète de /Traduction, tenue à jour en temps réel
const useCantiques = () => {
  const [cantiques, setCantiques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onValue(
        ref(db, "/Traduction"),
        (snapshot) => {
          const list = [];
          snapshot.forEach((child) => {
            list.push({ key: child.key, ...child.val() });
          });
          setCantiques(list);
          setLoading(false);
        },
        (error) => {
          console.error("Erreur lors du chargement des cantiques :", error);
          setLoading(false);
        }
      ),
    []
  );

  return { cantiques, loading };
};

export default useCantiques;
