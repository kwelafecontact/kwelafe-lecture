"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ONGLETS_PUBLIC = [
  { href: "/", ico: "🏠", nom: "Accueil", c: "#d6332a" },
  { href: "/catalogue", ico: "📚", nom: "Ma bibliothèque", c: "#2e9d4f" },
  { href: "/livres", ico: "📖", nom: "Mes lectures", c: "#1f6fb2" },
  { href: "/jeux", ico: "🎮", nom: "Jeux", c: "#e8a200" },
  { href: "/compte", ico: "👤", nom: "Mon compte", c: "#4b3a78" },
];

const ONGLETS_ELEVE = [
  { href: "/classe", ico: "🎒", nom: "Ma classe", c: "#2e9d4f" },
  { href: "/catalogue", ico: "📚", nom: "Livres", c: "#1f6fb2" },
  { href: "/ecole", ico: "✏️", nom: "Apprendre", c: "#4b3a78" },
  { href: "/ecole/jeux", ico: "🎮", nom: "Jeux", c: "#e8a200" },
  { href: "/compte", ico: "👤", nom: "Moi", c: "#d6332a" },
];

export default function NavBas() {
  const chemin = usePathname();
  const [eleve, setEleve] = useState(false);
  useEffect(() => { setEleve(document.cookie.includes("kw_espace=eleve")); }, []);
  const ONGLETS = eleve ? ONGLETS_ELEVE : ONGLETS_PUBLIC;
  return (
    <nav className="nav-bas" aria-label="Navigation principale">
      <ul>
        {ONGLETS.map((o) => {
          const actif = o.href === "/" ? chemin === "/" : o.href === "/ecole" ? chemin === "/ecole" : chemin.startsWith(o.href);
          return (
            <li key={o.href}>
              <Link href={o.href} className={actif ? "actif" : ""} style={{ ["--c" as any]: o.c }} aria-current={actif ? "page" : undefined}>
                <span className="ico" aria-hidden>{o.ico}</span>
                {o.nom}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
