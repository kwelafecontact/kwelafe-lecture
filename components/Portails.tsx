"use client";
// Entrée dans l'app : le logo s'anime (une fois par visite), on choisit son type de compte, puis son espace.
import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";

type Props = {
  prenom: string;
  visiteur: boolean;
  eleve: boolean;
  nbLivres: number;
  nbJeux: number;
  enCours: { titre: string; slug: string; pct: number } | null;
  couvertures: string[];
};
type Profil = "individuel" | "famille";

const PROFILS = [
  { id: "individuel", nom: "Compte individuel", detail: "Pour moi", ico: "👤", c: "#1f6fb2" },
  { id: "famille", nom: "Compte famille", detail: "Petits et grands ensemble", ico: "👨‍👩‍👧‍👦", c: "#e8a200" },
  { id: "ecole", nom: "École et collectivité", detail: "Classe, médiathèque, commune", ico: "🏫", c: "#2e9d4f" },
] as const;

export default function Portails({ prenom, visiteur, eleve, nbLivres, nbJeux, enCours, couvertures }: Props) {
  const [phase, setPhase] = useState<"intro" | "profil" | "choix">("intro");
  const [profil, setProfil] = useState<Profil>("individuel");
  const [dernier, setDernier] = useState("");

  const apresIntro = () => {
    let choisi = "";
    try { choisi = sessionStorage.getItem("kw-profil") || ""; } catch {}
    if (eleve) return setPhase("choix");
    if (choisi === "individuel" || choisi === "famille") { setProfil(choisi); setPhase("choix"); } else setPhase("profil");
  };

  useEffect(() => {
    try { sessionStorage.setItem("kw-portail", "1"); setDernier(localStorage.getItem("kw-profil") || ""); } catch {}
    let dejaVu = false;
    try { dejaVu = sessionStorage.getItem("kw-intro") === "1"; sessionStorage.setItem("kw-intro", "1"); } catch {}
    if (dejaVu) { apresIntro(); return; }
    const t = setTimeout(apresIntro, 2300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choisirProfil(id: string) {
    try { localStorage.setItem("kw-profil", id); sessionStorage.setItem("kw-profil", id); } catch {}
    if (id === "ecole") { window.location.href = "/etablissement"; return; }
    setProfil(id as Profil);
    setPhase("choix");
  }

  type Carte = { href: string; nom: string; ico: string; c: string; detail: string; couv?: string[]; bientot?: boolean };
  const portails: Carte[] = eleve
    ? [
        { href: "/classe", nom: "Ma classe", ico: "🎒", c: "#2e9d4f", detail: "La sélection de mon enseignant" },
        { href: "/", nom: "Bibliothèque", ico: "📚", c: "#1f6fb2", detail: `${nbLivres} livres à lire`, couv: couvertures },
        { href: "/ecole", nom: "Apprendre", ico: "✏️", c: "#4b3a78", detail: "Par niveau et par thème" },
        { href: "/jeux", nom: "Jeux", ico: "🎮", c: "#e8a200", detail: `${nbJeux} jeux péi` },
      ]
    : profil === "famille"
      ? [
          { href: "/", nom: "Bibliothèque", ico: "📚", c: "#1f6fb2", detail: `${nbLivres} livres pour tous`, couv: couvertures },
          { href: "/catalogue?public=enfants", nom: "Coin des enfants", ico: "🧸", c: "#2e9d4f", detail: "Albums, contes, imagiers" },
          { href: "/jeux", nom: "Jeux en famille", ico: "🎲", c: "#e8a200", detail: `${nbJeux} jeux péi` },
          { href: "/compte", nom: "Mon espace", ico: "⭐", c: "#d6332a", detail: visiteur ? "Créer mon compte" : "Progrès et favoris" },
        ]
      : [
          { href: "/", nom: "Bibliothèque", ico: "📚", c: "#1f6fb2", detail: `${nbLivres} livres à lire`, couv: couvertures },
          { href: "/jeux", nom: "Jeux", ico: "🎮", c: "#e8a200", detail: `${nbJeux} jeux péi` },
          { href: "/ecole", nom: "Apprendre", ico: "🎒", c: "#2e9d4f", detail: "Par niveau et par thème" },
          { href: "/compte", nom: "Mon espace", ico: "⭐", c: "#d6332a", detail: visiteur ? "Créer mon compte" : "Mes progrès, mes favoris" },
        ];

  return (
    <main className={`portails ${phase === "intro" ? "intro" : "choix"}`} onClick={() => phase === "intro" && apresIntro()}>
      <div className="portails-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-kw-rond.webp" alt="Kwélafé" />
      </div>

      {phase === "profil" && (
        <section className="portails-choix">
          <div className="portails-avatar"><Avatar taille={64} /></div>
          <h1>{prenom ? `Bonjour ${prenom} !` : "Bonjour !"}</h1>
          <p>Qui utilise Kwélafé aujourd'hui ?</p>
          <ul className="portails-grille profils">
            {PROFILS.map((p, i) => (
              <li key={p.id} style={{ ["--c" as any]: p.c, ["--i" as any]: i }}>
                <button type="button" className="portail" onClick={() => choisirProfil(p.id)}>
                  <span className="portail-ico" aria-hidden>{p.ico}</span>
                  <b>{p.nom}</b>
                  <small>{p.detail}</small>
                  {dernier === p.id && <em>Mon dernier choix</em>}
                </button>
              </li>
            ))}
          </ul>
          <p className="portails-devise">« Préserver aujourd'hui ce que nous voulons transmettre demain. »</p>
        </section>
      )}

      {phase !== "profil" && <section className="portails-choix" aria-hidden={phase === "intro"}>
        <div className="portails-avatar"><Avatar taille={64} /></div>
          <h1>{prenom ? `Bonjour ${prenom} !` : "Bonjour !"}</h1>
        <p>Où veux-tu aller aujourd'hui ?</p>

        <ul className="portails-grille">
          {portails.map((p, i) => (
            <li key={p.href} style={{ ["--c" as any]: p.c, ["--i" as any]: i }}>
              {p.bientot ? (
                <div className="portail bientot" aria-disabled>
                  <span className="portail-ico" aria-hidden>{p.ico}</span>
                  <b>{p.nom}</b>
                  <small>{p.detail}</small>
                  <em>Bientôt</em>
                </div>
              ) : (
                <Link href={p.href} className="portail">
                  {p.couv && p.couv.length > 0 ? (
                    <span className="portail-couvs" aria-hidden>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.couv.map((s) => <img key={s} src={s} alt="" />)}
                    </span>
                  ) : (
                    <span className="portail-ico" aria-hidden>{p.ico}</span>
                  )}
                  <b>{p.nom}</b>
                  <small>{p.detail}</small>
                </Link>
              )}
            </li>
          ))}
        </ul>

        {enCours && (
          <Link href={`/lire/${enCours.slug}`} className="portails-reprendre">
            <span>▶</span>
            <span>Reprendre <b>{enCours.titre}</b> <small>({enCours.pct} %)</small></span>
          </Link>
        )}
        {!eleve && <button type="button" className="portails-changer" onClick={() => { try { sessionStorage.removeItem("kw-profil"); } catch {} setPhase("profil"); }}>⇄ Changer de compte ({PROFILS.find((p) => p.id === profil)?.nom})</button>}
        <p className="portails-devise">« Préserver aujourd'hui ce que nous voulons transmettre demain. »</p>
      </section>}
    </main>
  );
}
