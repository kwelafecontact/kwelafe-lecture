"use client";
// Lecteur des livres-applications web (livres interactifs avec leurs propres pages, jeux et animations).
// Le livre tourne dans une iframe isolée ; sa mémoire (page, scores, records) est gardée ici.
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

type Props = {
  livre: { id: string; slug: string; titre: string; entree: string; pages: number };
  jeton: string;
  email: string;
};

export default function LecteurWeb({ livre, jeton, email }: Props) {
  const cle = `kw_web_${livre.id}`;
  const cadre = useRef<HTMLIFrameElement>(null);
  const dernierEnvoi = useRef(0);

  // Adresse du livre, avec sa mémoire de lecture (calculée une seule fois pour ne pas recharger l'iframe)
  const src = useMemo(() => {
    let memo = "{}";
    try { memo = localStorage.getItem(cle) || "{}"; } catch {}
    return `/c/${jeton}/${livre.entree}#kwls=${encodeURIComponent(memo)}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function recevoir(e: MessageEvent) {
      if (e.source !== cadre.current?.contentWindow || !e.data || typeof e.data.kwStore !== "object") return;
      const memo = e.data.kwStore as Record<string, string>;
      try { localStorage.setItem(cle, JSON.stringify(memo)); } catch {}
      // Progression : le livre garde sa page courante dans une clé qui se termine par « page »
      const k = Object.keys(memo).find((x) => /page$/.test(x));
      const page = k ? Number(JSON.parse(memo[k])) : NaN;
      if (!Number.isFinite(page) || !livre.pages) return;
      const maintenant = Date.now();
      if (maintenant - dernierEnvoi.current < 4000) return;
      dernierEnvoi.current = maintenant;
      const pourcentage = Math.round(((page + 1) / livre.pages) * 100);
      fetch("/api/progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ livre: livre.id, position: { i: page, f: 0 }, pourcentage }),
        keepalive: true,
      }).catch(() => {});
    }
    window.addEventListener("message", recevoir);
    return () => window.removeEventListener("message", recevoir);
  }, [cle, livre.id, livre.pages]);

  return (
    <div className="lecteur-web">
      <div className="lecteur-web-barre">
        <Link href={`/livre/${livre.slug}`} className="lecteur-web-retour" aria-label="Retour">‹ Retour</Link>
        <span className="lecteur-web-titre">{livre.titre}</span>
      </div>
      <iframe
        ref={cadre}
        src={src}
        title={livre.titre}
        className="lecteur-web-cadre"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        allow="autoplay; fullscreen"
      />
      <div className="lecteur-web-filigrane" aria-hidden>{email}</div>
    </div>
  );
}
