"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/", ico: "🏠", nom: "Accueil", c: "#d6332a" },
  { href: "/livres", ico: "📚", nom: "Mes livres", c: "#1f6fb2" },
  { href: "/catalogue", ico: "🔎", nom: "Catalogue", c: "#2e9d4f" },
  { href: "/jeux", ico: "🎮", nom: "Jeux", c: "#e8a200" },
  { href: "/compte", ico: "👤", nom: "Mon compte", c: "#4b3a78" },
];

export default function NavBas() {
  const chemin = usePathname();
  return (
    <nav className="nav-bas" aria-label="Navigation principale">
      <ul>
        {ONGLETS.map((o) => {
          const actif = o.href === "/" ? chemin === "/" : chemin.startsWith(o.href);
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
