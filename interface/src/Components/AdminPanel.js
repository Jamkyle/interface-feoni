import React, { useState, useEffect } from "react";
import { ref, onValue, update, set } from "firebase/database";
import { db } from "../store/firebase";

const formatDate = (timestamp) =>
  timestamp ? new Date(timestamp).toLocaleString("fr-FR") : "";

// Gestion des comptes admin : demandes en attente et admins actuels
const AdminPanel = ({ user }) => {
  const [requests, setRequests] = useState({});
  const [admins, setAdmins] = useState({});
  const [adminInfo, setAdminInfo] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const onError = (err) => console.error("Erreur de lecture :", err);
    const unsubscribes = [
      onValue(ref(db, "/adminRequests"), (s) => setRequests(s.val() || {}), onError),
      onValue(ref(db, "/admins"), (s) => setAdmins(s.val() || {}), onError),
      onValue(ref(db, "/adminInfo"), (s) => setAdminInfo(s.val() || {}), onError),
    ];
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  // Enregistre l'email de l'admin connecté s'il n'est pas encore connu
  useEffect(() => {
    if (admins[user.uid] && !adminInfo[user.uid]) {
      set(ref(db, `/adminInfo/${user.uid}`), {
        email: user.email,
        name: user.displayName || "",
      }).catch((err) => console.error("Erreur adminInfo :", err));
    }
  }, [admins, adminInfo, user]);

  const run = async (updates, failMessage) => {
    setError("");
    try {
      await update(ref(db), updates);
    } catch (err) {
      console.error(failMessage, err);
      setError(failMessage);
    }
  };

  const approve = (uid) =>
    run(
      {
        [`/admins/${uid}`]: true,
        [`/adminInfo/${uid}`]: {
          email: requests[uid].email,
          name: requests[uid].name || "",
        },
        [`/adminRequests/${uid}`]: null,
      },
      "La demande n'a pas pu être acceptée"
    );

  const refuse = (uid) =>
    run({ [`/adminRequests/${uid}`]: null }, "La demande n'a pas pu être refusée");

  const revoke = (uid) => {
    const label = adminInfo[uid]?.email || uid;
    if (!window.confirm(`Retirer les droits admin de ${label} ?`)) return;
    run(
      { [`/admins/${uid}`]: null, [`/adminInfo/${uid}`]: null },
      "Les droits n'ont pas pu être retirés"
    );
  };

  const requestIds = Object.keys(requests);
  const adminIds = Object.keys(admins).filter((uid) => admins[uid] === true);

  return (
    <section className="card admin-panel">
      <h2>Comptes admin</h2>
      {error && <p className="notice notice--error">{error}</p>}

      <h3>Demandes en attente ({requestIds.length})</h3>
      {requestIds.length === 0 ? (
        <p className="muted">Aucune demande</p>
      ) : (
        <ul className="admin-panel__list">
          {requestIds.map((uid) => (
            <li key={uid}>
              <span>
                {requests[uid].name && <b>{requests[uid].name} </b>}
                {requests[uid].email}
                <small> — {formatDate(requests[uid].timestamp)}</small>
              </span>
              <span>
                <button className="btn btn--small btn--primary" onClick={() => approve(uid)}>
                  Accepter
                </button>
                <button className="btn btn--small" onClick={() => refuse(uid)}>
                  Refuser
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3>Admins ({adminIds.length})</h3>
      <ul className="admin-panel__list">
        {adminIds.map((uid) => (
          <li key={uid}>
            <span>
              {adminInfo[uid]?.name && <b>{adminInfo[uid].name} </b>}
              {adminInfo[uid]?.email || uid}
              {uid === user.uid && " (vous)"}
            </span>
            {uid !== user.uid && (
              <button className="btn btn--small btn--danger" onClick={() => revoke(uid)}>
                Retirer
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AdminPanel;
