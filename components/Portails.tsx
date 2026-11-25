"use client";
// Entrée dans l'app : le logo s'anime (une fois par visite), puis on choisit son espace.
import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  prenom: string;
  visiteur: boolean;
  nbLivres: number;
  nbJeux: number;
  enCours: { titre: string; slug: string; pct: number } | null;
  couvertures: string[];
};

export default function Portails({ prenom, visiteur, nbLivres, nbJeux, enCours, couvertures }: Props) {
  const [phase, setPhase] = useState<"intro" | "choix">("intro");

  useEffect(() => {
    try { sessionStorage.setItem("kw-portail", "1"); } catch {}
    let dejaVu = false;
    try { dejaVu = sessionStorage.getItem("kw-intro") === "1"; sessionStorage.setItem("kw-intro", "1"); } catch {}
    if (dejaVu) { setPhase("choix"); return; }
    const t = setTimeout(() => setPhase("choix"), 2300);
    return () => clearTimeout(t);
  }, []);

  const portails = [
    { href: "/", nom: "Bibliothèque", ico: "📚", c: "#1f6fb2", detail: `${nbLivres} livres à lire`, couv: couvertures },
    { href: "/jeux", nom: "Jeux", ico: "🎮", c: "#e8a200", detail: `${nbJeux} jeux péi` },
    { href: "/ecole", nom: "École", ico: "🎒", c: "#2e9d4f", detail: "Par niveau et par thème", bientot: true },
    { href: "/compte", nom: "Mon espace", ico: "⭐", c: "#d6332a", detail: visiteur ? "Créer mon compte" : "Mes progrès, mes favoris" },
  ];

  return (
    <main className={`portails ${phase}`} onClick={() => phase === "intro" && setPhase("choix")}>
      <div className="portails-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-kw-rond.webp" alt="Kwélafé" />
      </div>

      <section className="portails-choix" aria-hidden={phase === "intro"}>
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
        <p className="portails-devise">« Préserver aujourd'hui ce que nous voulons transmettre demain. »</p>
      </section>
    </main>
  );
}
