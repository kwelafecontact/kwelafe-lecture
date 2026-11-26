"use client";
import { useEffect, useState } from "react";
import Lecteur from "@/components/Lecteur";
import { listerHL, supprimerHL, verifierHL, MAX_LIVRES, type LivreHL } from "@/lib/hors-ligne";

export default function HorsLigneBiblio() {
  const [livres, setLivres] = useState<LivreHL[] | null>(null);
  const [ouvert, setOuvert] = useState<LivreHL | null>(null);
  const charger = () => listerHL().then(setLivres).catch(() => setLivres([]));
  useEffect(() => { verifierHL().finally(charger); }, []);
  if (ouvert) {
    const pos = (() => { try { return JSON.parse(localStorage.getItem(`kw-hl-pos-${ouvert.id}`) || "null") || { i: 0, f: 0 }; } catch { return { i: 0, f: 0 }; } })();
    return <Lecteur livre={{ id: ouvert.id, slug: ouvert.slug, titre: ouvert.titre, manifeste: ouvert.manifeste }} jetonInitial={`hl/${ouvert.id}`} positionInitiale={pos} email="" horsLigne onFermer={() => setOuvert(null)} />;
  }
  return (
    <main className="page">
      <header className="entete"><div><div className="sur-titre">Sans internet</div><h1>Mes livres hors connexion</h1></div></header>
      <p className="texte-doux">Jusqu'à {MAX_LIVRES} livres, gardés 30 jours sur cet appareil. Ils se prolongent tout seuls dès que tu repasses en ligne avec ton abonnement actif.</p>
      {livres === null ? <p>Chargement…</p> : livres.length === 0 ? (
        <section className="panneau"><p>Aucun livre pour le moment. Ouvre la fiche d'un livre et touche « Lire sans connexion ».</p></section>
      ) : (
        <div className="liste-hl">
          {livres.map((l) => {
            const jours = Math.ceil((l.expire - Date.now()) / 86400000);
            const fini = jours <= 0;
            return (
              <div key={l.id} className="carte-hl">
                <button className="carte-hl-ouvrir" disabled={fini} onClick={() => setOuvert(l)}>
                  <b>{l.titre}</b>
                  <small>{fini ? "Expiré : reconnecte-toi pour le prolonger" : `Disponible encore ${jours} jour${jours > 1 ? "s" : ""}`}</small>
                </button>
                <button className="lien" onClick={async () => { await supprimerHL(l.id); charger(); }}>Retirer</button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
