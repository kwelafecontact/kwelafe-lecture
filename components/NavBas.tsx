"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icone from "./Icones";

const ONGLETS_PUBLIC = [
  { href: "/", ico: "accueil", nom: "Accueil", c: "#d6332a" },
  { href: "/catalogue", ico: "biblio", nom: "Ma bibliothèque", c: "#2e9d4f" },
  { href: "/livres", ico: "lectures", nom: "Mes lectures", c: "#1f6fb2" },
  { href: "/jeux", ico: "jeux", nom: "Jeux", c: "#e8a200" },
  { href: "/compte", ico: "compte", nom: "Mon compte", c: "#4b3a78" },
];

const ONGLETS_ELEVE = [
  { href: "/classe", ico: "classe", nom: "Ma classe", c: "#2e9d4f" },
  { href: "/catalogue", ico: "biblio", nom: "Livres", c: "#1f6fb2" },
  { href: "/ecole", ico: "apprendre", nom: "Apprendre", c: "#4b3a78" },
  { href: "/ecole/jeux", ico: "jeux", nom: "Jeux", c: "#e8a200" },
  { href: "/compte", ico: "compte", nom: "Moi", c: "#d6332a" },
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
                <span className="ico"><Icone nom={o.ico} taille={24} /></span>
                {o.nom}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
