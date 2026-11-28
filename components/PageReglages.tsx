"use client";
// Tous les réglages de l'app au même endroit, appliqués tout de suite.
import { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAUT, ecrireReglages, lireReglages, type Reglages } from "@/lib/reglages";

export default function PageReglages() {
  const [r, setR] = useState<Reglages>(DEFAUT);
  const [ok, setOk] = useState(false);
  useEffect(() => setR(lireReglages()), []);
  const maj = (p: Partial<Reglages>) => { const n = { ...r, ...p }; setR(n); ecrireReglages(n); setOk(true); setTimeout(() => setOk(false), 1200); };
  const Choix = <K extends keyof Reglages>({ cle, options }: { cle: K; options: [Reglages[K], string][] }) => (
    <div className="rg-choix">{options.map(([v, l]) => <button key={String(v)} className={r[cle] === v ? "actif" : ""} onClick={() => maj({ [cle]: v } as Partial<Reglages>)}>{l}</button>)}</div>
  );
  const Bascule = ({ cle, titre, aide }: { cle: keyof Reglages; titre: string; aide?: string }) => (
    <label className="rg-ligne"><div><b>{titre}</b>{aide && <small>{aide}</small>}</div>
      <input type="checkbox" className="rg-bascule" checked={!!r[cle]} onChange={(e) => maj({ [cle]: e.target.checked } as Partial<Reglages>)} /></label>
  );
  return (
    <>
      <header className="entete-editorial"><div className="eyebrow">Mon app</div><h1>Réglages</h1><p>Tout se règle ici une fois pour toutes, et s'applique tout de suite.{ok && <span className="rg-ok"> ✓ Enregistré</span>}</p></header>

      <section className="rg-bloc"><h2>👁️ Affichage</h2>
        <div className="rg-ligne"><b>Taille du texte</b><Choix cle="taille" options={[["normal", "A"], ["grand", "A+"], ["tres-grand", "A++"]]} /></div>
        <div className="rg-ligne"><b>Couleur de l'île</b><Choix cle="couleur" options={[["lave", "🌋 Volcan"], ["lagon", "🐠 Lagon"], ["cirques", "⛰️ Cirques"], ["flamboyant", "🌺 Flamboyant"], ["vanille", "🌿 Vanille"], ["bourbon", "🌳 Bourbon"]]} /></div>
        <div className="rg-ligne"><b>Ambiance</b><Choix cle="theme" options={[["clair", "☀️ Clair"], ["sepia", "📜 Sépia"], ["nuit", "🌙 Nuit"]]} /></div>
        <Bascule cle="animations" titre="Animations" aide="Coupe les mouvements si tu préfères une app plus calme." />
        <Bascule cle="sons" titre="Sons des jeux" />
      </section>

      <section className="rg-bloc"><h2>📖 Lecture</h2>
        <div className="rg-ligne"><div><b>Format préféré</b><small>Mis en premier sur la fiche d'un livre quand les deux existent.</small></div><Choix cle="format" options={[["epub", "📖 EPUB"], ["pdf", "📄 Classique"]]} /></div>
        <div className="rg-ligne"><div><b>Objectif de lecture</b><small>Minutes par jour, affichées sur l'accueil.</small></div><Choix cle="objectif" options={[[5, "5"], [10, "10"], [15, "15"], [30, "30"]]} /></div>
        <Bascule cle="sansHorreur" titre="Masquer les livres d'horreur et de superstitions" aide="Conseillé si de jeunes enfants utilisent l'app." />
      </section>

      <section className="rg-bloc"><h2>🐦 Apprendre le créole</h2>
        <Bascule cle="profilAuto" titre="Demander qui joue à chaque ouverture" aide="Chaque membre de la famille garde son parcours." />
        <Bascule cle="apprendreSansCoeurs" titre="Mode doux (sans cœurs)" aide="On ne perd jamais de cœur : idéal pour les débutants et les enfants." />
      </section>

      <section className="rg-bloc"><h2>🧸 Enfants</h2>
        <div className="rg-ligne"><div><b>Pause écran</b><small>Message de pause dans le coin des enfants après…</small></div><Choix cle="limiteEnfants" options={[[0, "Jamais"], [15, "15 min"], [30, "30 min"], [45, "45 min"]]} /></div>
        <Link className="rg-lien" href="/parents">🔒 Espace parents : progrès de chaque enfant</Link>
      </section>

      <section className="rg-bloc"><h2>👤 Compte</h2>
        <Link className="rg-lien" href="/apprendre">👥 Profils de la famille</Link>
        <Link className="rg-lien" href="/mes-livres-hors-ligne">✈️ Livres sans connexion</Link>
        <Link className="rg-lien" href="/compte">💳 Mon compte et mon abonnement</Link>
        <button className="rg-lien" onClick={() => { ecrireReglages(DEFAUT); setR(DEFAUT); }}>↺ Remettre les réglages par défaut</button>
      </section>
    </>
  );
}
