"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  { href: "/", ico: "🏠", nom: "Accueil" },
  { href: "/livres", ico: "📚", nom: "Mes livres" },
  { href: "/catalogue", ico: "🔎", nom: "Catalogue" },
  { href: "/compte", ico: "👤", nom: "Mon compte" },
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
              <Link href={o.href} className={actif ? "actif" : ""} aria-current={actif ? "page" : undefined}>
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
