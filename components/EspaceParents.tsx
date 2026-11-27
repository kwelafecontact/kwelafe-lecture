"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Fiche = { nom: string; avatar: string; xp: number; serie: number; dernier: string | null; unites: number; etoiles: number; xpSemaine: number };

function quand(j: string | null) {
  if (!j) return "pas encore commencé";
  const d = Math.round((Date.now() - new Date(j + "T12:00:00").getTime()) / 86400000);
  return d <= 0 ? "aujourd'hui" : d === 1 ? "hier" : `il y a ${d} jours`;
}

export default function EspaceParents() {
  const [d, setD] = useState<{ titulaire: Fiche; profils: Fiche[] } | null>(null);
  const [erreur, setErreur] = useState("");
  useEffect(() => { fetch("/api/parents").then(async (r) => { const j = await r.json(); if (!r.ok) setErreur(j.erreur || "Erreur"); else setD(j); }).catch(() => setErreur("Connexion impossible.")); }, []);
  if (erreur) return <p className="texte-doux">{erreur} <a href="/auth/login">Me connecter</a></p>;
  if (!d) return <p className="texte-doux">Chargement…</p>;
  const tous = [d.titulaire, ...d.profils];
  return (
    <>
      <section className="section">
        <h2>📈 Les progrès en créole</h2>
        <div className="parents-fiches">
          {tous.map((f) => (
            <div key={f.nom} className="parents-fiche">
              <div className="pf-tete"><span>{f.avatar}</span><b>{f.nom}</b></div>
              <div className="pf-stats">
                <div><b>{f.unites}</b><small>unités finies</small></div>
                <div><b>{"★".repeat(Math.min(3, Math.round(f.etoiles / Math.max(1, f.unites))))}</b><small>moyenne</small></div>
                <div><b>🔥 {f.serie}</b><small>jours de suite</small></div>
                <div><b>{f.xpSemaine}</b><small>XP cette semaine</small></div>
              </div>
              <small className="texte-doux">Dernière leçon : {quand(f.dernier)}</small>
            </div>
          ))}
        </div>
        {d.profils.length === 0 && <p className="texte-doux">Aucun profil enfant pour l'instant. Crée-en un dans <Link href="/apprendre">Apprendre le créole</Link> (« Ajouter »).</p>}
      </section>
      <section className="section panneau">
        <h2>💡 Nos conseils</h2>
        <ul className="parents-conseils">
          <li><b>10 à 15 minutes par jour</b> suffisent : mieux vaut un peu chaque jour qu'une longue séance.</li>
          <li>Lisez ou jouez <b>ensemble</b> de temps en temps : dites les mots créoles à voix haute.</li>
          <li>Pour les 3-6 ans, préférez <Link href="/enfants/creole">Mon premier créole</Link> (sans cœurs ni classement).</li>
          <li>L'app ne contient <b>aucune publicité</b> et ne collecte que le prénom du profil.</li>
        </ul>
      </section>
      <section className="section">
        <h2>⚙️ Gérer</h2>
        <div className="parents-actions">
          <Link className="btn secondaire" href="/apprendre">👥 Profils de la famille</Link>
          <Link className="btn secondaire" href="/compte">👤 Mon compte et abonnement</Link>
          <button className="btn secondaire" onClick={() => { try { sessionStorage.removeItem("kw-parent"); } catch {} location.href = "/enfants"; }}>🔒 Quitter l'espace parents</button>
        </div>
      </section>
    </>
  );
}
