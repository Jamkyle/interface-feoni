import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import "./css/App.css";
import { auth } from "./store/firebase";
import useAuth from "./hooks/useAuth";
import useCantiques from "./hooks/useCantiques";
import Header from "./Components/Header";
import LoginPage from "./pages/LoginPage";
import EditorPage from "./pages/EditorPage";
import MissingPage from "./pages/MissingPage";
import ExportPage from "./pages/ExportPage";
import AdminPanel from "./Components/AdminPanel";

const GUEST_KEY = "feoni-guest";

const readGuest = () => {
  try {
    return sessionStorage.getItem(GUEST_KEY) === "1";
  } catch {
    return false;
  }
};

const writeGuest = (value) => {
  try {
    if (value) sessionStorage.setItem(GUEST_KEY, "1");
    else sessionStorage.removeItem(GUEST_KEY);
  } catch {
    // stockage indisponible : le mode invité ne survivra pas au rechargement
  }
};

const App = () => {
  const { user, ready, isAdmin, authError, setAuthError } = useAuth();
  const { cantiques, loading } = useCantiques();
  const [guest, setGuest] = useState(readGuest);
  const [tab, setTab] = useState("editor");
  // Cantique à ouvrir dans l'éditeur depuis un autre onglet
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (user) {
      setGuest(false);
      writeGuest(false);
    }
  }, [user]);

  useEffect(() => {
    if (tab === "admins" && !isAdmin) setTab("editor");
  }, [tab, isAdmin]);

  if (!ready) return <div className="splash">Chargement…</div>;

  if (!user && !guest) {
    return (
      <LoginPage
        authError={authError}
        onGuest={() => {
          setGuest(true);
          writeGuest(true);
        }}
      />
    );
  }

  const tabs = [
    { id: "editor", label: "Éditeur" },
    { id: "missing", label: "Sans traduction" },
    { id: "export", label: "Export" },
    ...(isAdmin ? [{ id: "admins", label: "Admins" }] : []),
  ];

  const backToLogin = () => {
    setAuthError("");
    setGuest(false);
    writeGuest(false);
  };

  const openInEditor = (id) => {
    setOpenId(id);
    setTab("editor");
  };

  return (
    <div className="app">
      <Header
        tabs={tabs}
        tab={tab}
        onTab={setTab}
        user={user}
        isAdmin={isAdmin}
        onLogin={backToLogin}
        onLogout={() => signOut(auth)}
      />
      <main className="app__main">
        {/* L'éditeur reste monté pour ne pas perdre une saisie en cours */}
        <div hidden={tab !== "editor"}>
          <EditorPage
            cantiques={cantiques}
            loading={loading}
            user={user}
            canEdit={isAdmin}
            openId={openId}
            onOpened={() => setOpenId(null)}
          />
        </div>
        {tab === "missing" && (
          <MissingPage cantiques={cantiques} loading={loading} onOpen={openInEditor} />
        )}
        {tab === "export" && <ExportPage cantiques={cantiques} />}
        {tab === "admins" && isAdmin && <AdminPanel user={user} />}
      </main>
    </div>
  );
};

export default App;
