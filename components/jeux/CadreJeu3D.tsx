"use client";
import { useEffect, useRef } from "react";

/**
 * Cadre plein écran des jeux 3D statiques (public/jeux-3d).
 * Quand on quitte la page par la navigation du site (geste retour, barre du bas…),
 * le jeu est d'abord libéré : sinon son contexte WebGL restait actif jusqu'au passage
 * du ramasse-miettes, et après quelques jeux iOS coupait les plus anciens (écran noir).
 */
export default function CadreJeu3D({ src, titre }: { src: string; titre: string }) {
  const cadre = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const el = cadre.current;
    return () => {
      if (!el) return;
      try {
        const w = el.contentWindow as (Window & { kwelafeLiberer?: () => void }) | null;
        w?.kwelafeLiberer?.();
      } catch { /* cadre déjà fermé */ }
      try { el.src = "about:blank"; } catch { /* rien */ }
    };
  }, []);
  return (
    <iframe
      ref={cadre}
      src={src}
      title={titre}
      allow="fullscreen; autoplay"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", border: 0, background: "#0b1530", zIndex: 50 }}
    />
  );
}
