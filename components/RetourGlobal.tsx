"use client";
// Bouton « ← Retour » présent sur toutes les pages (sauf l'accueil, l'écran d'entrée et le lecteur).
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SANS = [/^\/$/, /^\/portails/, /^\/lire\//, /^\/auth/, /^\/bienvenue/];

export default function RetourGlobal() {
  const chemin = usePathname();
  const router = useRouter();
  const [doublon, setDoublon] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDoublon(!!document.querySelector(".retour, .retour-themes, .app-lecon, .barre-retour-classe")), 50);
    return () => clearTimeout(t);
  }, [chemin]);
  if (SANS.some((r) => r.test(chemin)) || doublon) return null;
  const retour = () => { if (window.history.length > 1) router.back(); else router.push("/"); };
  return <button className="retour-global" onClick={retour} aria-label="Revenir à la page précédente">← Retour</button>;
}
