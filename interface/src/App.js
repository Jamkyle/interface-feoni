import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ref, push } from "firebase/database"; // Firebase modulaire
import TextAera from "./Components/TextAera";
import TextInput from "./Components/TextInput";
import Categories from "./Components/Categories";
import "./css/App.css";
import { db } from "./store/firebase";
import { updateTrad } from "./helpers/dbUtils";
import { getCantiqueAndExport } from "./helpers/exportCantique";
import { isACantique } from "./helpers/checkUtils";

const App = () => {
  const dispatch = useDispatch();

  // State local
  const [show, setShow] = useState(250);
  const [list, setList] = useState([]);
  const [listTrad, setListTrad] = useState([]);
  const [messages, setMessages] = useState("");

  // Accès au state Redux
  const { id, trad, listCantiques, categories, tradData, cantiqueData } =
    useSelector((state) => state);

  // Variables locales
  const francais = useMemo(() => trad?.strophe?.[0]?.trad || "", [trad]);
  const malgache = useMemo(() => trad?.strophe?.[0]?.cantique || "", [trad]);
  const title = useMemo(() => trad?.titre || "", [trad]);

  // Charger la liste des cantiques au montage
  useEffect(() => {
    dispatch({ type: "GET_LIST_CANTIQUE" });
  }, [dispatch]);
  // Mettre à jour les listes lorsque listCantiques change
  useEffect(() => {
    if (listCantiques) {
      const newList = listCantiques.map((e) =>
        isNaN(e.id) ? e.id : Number(e.id)
      );
      const newListTrad = listCantiques
        .filter((e) => e.strophe[0]?.trad !== "")
        .map((e) => (isNaN(e.id) ? e.id : Number(e.id)));

      setList(newList);
      setListTrad(newListTrad);
    }
  }, [listCantiques]);

  // Fonction pour afficher/cacher le tutoriel
  const toggleShow = () => {
    setShow((prevShow) => (prevShow >= 200 ? 0 : 250));
  };

  // Fonction pour soumettre un cantique
  const submit = async (data) => {
    const dateLastUpdate = new Date().toISOString();
    if (trad?.id) {
      const isSuccess = await updateTrad(trad.id, data);
      // Mise à jour existante
      const message = isSuccess
        ? `Le cantique : ${trad.id} a bien été modifié et sauvegardé dans la base`
        : `une erreur est survenue lors de la mise à jour du cantique : ${trad.id}`;
      setMessages({
        color: isSuccess ? "#3E6" : "#F33",
        message,
      });

      dispatch({ type: "GET_CANTIQUE_TRADUCTION", id: trad.id });
    } else {
      // Création d'un nouvel élément
      await push(ref(db, "/Traduction"), {
        id,
        strophe: [data],
        titre: title,
        date_last_update: dateLastUpdate,
      });

      setMessages({
        color: "#3E6",
        message: `Le cantique : ${id} a bien été créé et sauvegardé dans la base`,
      });

      dispatch({ type: "GET_CANTIQUE_TRADUCTION", id });
    }
  };

  // Calculer les cantiques sans traduction
  const listDiff = (list) => {
    const fullList = Array.from({ length: 828 }, (_, i) => i + 1);
    return fullList.filter((x) => !list.includes(x));
  };
  const listDiffTrad = useMemo(
    () =>
      listDiff(listTrad).map((e) => (
        <span style={{ color: "#4e7", margin: "2px" }} key={e}>
          {e}
        </span>
      )),
    [listTrad]
  );

  const num = id.includes(categories) ? id : categories + id;

  return (
    <div className="App">
      <h1>
        Interface Gestion <br /> Feoni
      </h1>
      <div className="App-editeur">
        <div>
          <button
            onClick={toggleShow}
            style={{
              cursor: "pointer",
              background: "#47e",
              border: "1px solid black",
              padding: "5px",
              borderRadius: "10px",
              color: "#eee",
            }}
          >
            Afficher/Cacher le tutoriel
          </button>
        </div>
        <div className="tuto" style={{ height: show }}>
          <h2>Pour éditer un cantique</h2>
          <p>
            Étape :
            <br />
            1. Choisir la catégorie (FFPM, ANTEMA, TSANTA ...)
            <br />
            2. Entrer le numéro du cantique
            <br />
            3. Appuyez sur Commencer directement{" "}
            <i>(oui le titre se remplit automatiquement :) )</i>
            <br />
            <br />
            4. Remplir la traduction
            <br />
            5. Remplir le cantique en malgache s'il n'apparaît pas
            <br />
            6. Appuyez sur Sauvegarder pour enregistrer dans la base
          </p>
          <p style={{ fontSize: "0.8em", color: "#47E" }}>
            <i>
              Si aucun titre n'est affiché ou qu'il n'a pas changé, c'est qu'il
              n'existe pas.
              <br /> Remplissez ou corrigez le champ.
            </i>
          </p>
          <h2>Pour exporter un/des cantique(s)</h2>
          <ul style={{ fontSize: "1em", listStyleType: "none" }}>
            <li>
              1. Entrer le/les numeros de cantique que vous voulez exporter
              <br />
              <span style={{ fontSize: "13px" }}>
                a. definir les numeros séparé d'une virgule, exemple:
                300,304,800
              </span>
              <br />
              <span style={{ fontSize: "13px" }}>
                b. definir une intervalle de valeur avec un tiret, exemple:
                300-800
              </span>
            </li>
            <li>
              2. Cliquer sur exporter, des fichier txt sera téléchargé en .txt
            </li>
            <li>
              3. Si une pop up vous demande d'autoriser le téléchargement de
              plusieurs fichier, accéptez
            </li>
          </ul>
        </div>
        <div className="messages">
          <span style={{ color: messages.color }}>{messages.message}</span>
        </div>
        <div className="App-options">
          <Categories cats={["FFPM", "TSANTA", "ANTEMA", "FF"]} />
          <TextInput name={"num"} />
          <button
            onClick={() => {
              if (id.indexOf(",") !== -1) {
                alert(
                  "Je ne peux pas traiter plusieurs cantiques en mâme temps"
                );
                return;
              }

              if (isACantique(id)) {
                dispatch({ type: "GET_CANTIQUE_TRADUCTION", id: num });
                setMessages({
                  color: "#3E6",
                  message: `Cantique ${id} prêt à être modifié`,
                });
              } else {
                setMessages({
                  color: "#F33",
                  message: `Cantique ${id} n'existe pas et ne peut pas être modifié`,
                });
              }
            }}
          >
            Commencer
          </button>
          <button onClick={() => getCantiqueAndExport(id)}>Exporter</button>
          <div>
            <TextInput name={"title"} style={{ width: "100%" }} />
          </div>
        </div>
        <TextAera
          name={"francais"}
          placeholder="Contenu en français"
          content={francais}
        />
        <TextAera
          name={"malgache"}
          placeholder="Contenu en malgache"
          content={malgache}
        />
      </div>
      <button
        onClick={() => submit({ trad: tradData, cantique: cantiqueData })}
      >
        Sauvegarder
      </button>
      <p>Liste des cantiques sans traduction ({listDiffTrad.length})</p>
      <div style={{ display: "flex", flexWrap: "wrap" }}>{listDiffTrad}</div>
    </div>
  );
};

export default App;
