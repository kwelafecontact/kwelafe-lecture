"use client";
// Espace éditeur : les livres rangés par format (onglets), avec recherche et filtre par univers.
import { useMemo, useState } from "react";
import Link from "next/link";
import { UNIVERS } from "@/lib/config";
import EditionLivre from "./EditionLivre";
import BasculeAdmin from "./BasculeAdmin";
import SupprimerBrouillon from "./SupprimerBrouillon";

export type LigneAdmin = {
  id: string; slug: string; titre: string; resume: string | null; univers: string | null; shopify_product_id: string | null; url_boutique: string | null;
  publie: boolean; inclus_abonnement: boolean; mystere_du_mois: boolean; gratuit: boolean; format: "pdf" | "epub" | "anime" | "interactif"; cree_le: string;
};

const ONGLETS = [
  { id: "pdf", nom: "PDF", emoji: "📄", couleur: "#d6332a" },
  { id: "epub", nom: "EPUB", emoji: "📖", couleur: "#1f6fb2" },
  { id: "anime", nom: "EPUB animés", emoji: "🎞️", couleur: "#7a2e8f" },
  { id: "interactif", nom: "Livres interactifs", emoji: "✨", couleur: "#2e9d4f" },
  { id: "brouillons", nom: "Brouillons", emoji: "📝", couleur: "#777" },
] as const;

export default function ListeLivresAdmin({ livres }: { livres: LigneAdmin[] }) {
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]["id"]>("pdf");
  const [q, setQ] = useState("");
  const [univers, setUnivers] = useState("");
  const [tri, setTri] = useState<"titre" | "recent">("titre");

  const compte = (id: string) => livres.filter((l) => (id === "brouillons" ? !l.publie : l.publie && l.format === id)).length;
  const liste = useMemo(() => livres
    .filter((l) => (onglet === "brouillons" ? !l.publie : l.publie && l.format === onglet))
    .filter((l) => !univers || l.univers === univers)
    .filter((l) => !q || l.titre.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (tri === "titre" ? a.titre.localeCompare(b.titre, "fr") : b.cree_le.localeCompare(a.cree_le))), [livres, onglet, q, univers, tri]);

  return (
    <div>
      <div className="onglets-admin" role="tablist">
        {ONGLETS.map((o) => (
          <button key={o.id} role="tab" aria-selected={onglet === o.id} className={onglet === o.id ? "actif" : ""} style={{ ["--c" as any]: o.couleur }} onClick={() => setOnglet(o.id)}>
            <span>{o.emoji}</span> {o.nom} <b>{compte(o.id)}</b>
          </button>
        ))}
      </div>
      <div className="filtres-admin">
        <input placeholder="🔎 Rechercher un titre…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={univers} onChange={(e) => setUnivers(e.target.value)}>
          <option value="">Tous les univers</option>
          {UNIVERS.map((u) => <option key={u.id} value={u.id}>{u.emoji} {u.nom}</option>)}
        </select>
        <select value={tri} onChange={(e) => setTri(e.target.value as "titre" | "recent")}>
          <option value="titre">Tri : A → Z</option>
          <option value="recent">Tri : plus récents</option>
        </select>
      </div>
      {onglet === "brouillons" && <p className="texte-doux">Ces livres ne sont pas visibles par les lecteurs. Ce sont souvent d'anciens doublons d'import : publie ceux qui sont bons.</p>}
      {liste.length === 0 ? <p className="texte-doux">Aucun livre ici.</p> : (
        <div className="liste-livres-admin">
          {liste.map((l) => {
            const u = UNIVERS.find((x) => x.id === l.univers);
            return (
              <div key={l.id} className="carte-livre-admin">
                <div className="cla-titre">
                  <EditionLivre livre={l} sousTitre={`${u ? `${u.emoji} ${u.nom}` : "Sans univers"}${l.shopify_product_id ? "" : " · ⚠️ pas de fiche boutique"}${l.resume ? "" : " · ⚠️ sans résumé"}`} />
                </div>
                <div className="cla-bascules">
                  <BasculeAdmin id={l.id} champ="publie" valeur={l.publie} libelle="Publié" />
                  <BasculeAdmin id={l.id} champ="inclus_abonnement" valeur={l.inclus_abonnement} libelle="Inclus abonnement" />
                  <BasculeAdmin id={l.id} champ="gratuit" valeur={l.gratuit} libelle="Gratuit" />
                  <BasculeAdmin id={l.id} champ="mystere_du_mois" valeur={l.mystere_du_mois} libelle="Mystère du mois" />
                </div>
                <Link className="lien cla-voir" href={`/lire/${l.slug}`}>Prévisualiser ›</Link>
                {!l.publie && <BasculeAdmin id={l.id} champ="bientot" valeur={!!(l as any).bientot} libelle="Bientôt (grisé)" />}
                {!l.publie && <SupprimerBrouillon id={l.id} titre={l.titre} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
