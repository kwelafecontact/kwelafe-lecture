// Sert les morceaux de livre (pages, images, styles) uniquement avec un jeton valide.
// Le fichier complet du livre n'est jamais transmis.
import { NextRequest, NextResponse } from "next/server";
import { lireJetonContenu } from "@/lib/jeton-contenu";
import { livreParId } from "@/lib/donnees";
import { stockage } from "@/lib/cf";
import { SCRIPT_CHAPITRE, SCRIPT_WEB } from "@/lib/script-chapitre";

const TYPES: Record<string, string> = {
  xhtml: "application/xhtml+xml; charset=utf-8", html: "text/html; charset=utf-8", htm: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8", js: "text/javascript; charset=utf-8", svg: "image/svg+xml",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", avif: "image/avif",
  mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg", wav: "audio/wav", mp4: "video/mp4", webm: "video/webm",
  woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf", json: "application/json", xml: "application/xml",
  ncx: "application/xml", opf: "application/xml",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ jeton: string; chemin: string[] }> }) {
  const { jeton, chemin } = await params;
  const droit = await lireJetonContenu(jeton);
  if (!droit) return new NextResponse("Lien expiré. Reviens à ta bibliothèque.", { status: 403 });

  const relatif = chemin.map(decodeURIComponent).join("/");
  if (relatif.includes("..") || /\.(opf|epub)$/i.test(relatif)) return new NextResponse("Interdit", { status: 403 });

  // Extrait gratuit : seules les premières pages (ou le premier chapitre) peuvent être lues
  if (droit.x) {
    const n = relatif.match(/^pdf\/(\d+)\./);
    if (n) { if (Number(n[1]) > droit.x) return new NextResponse("Extrait terminé", { status: 403 }); }
    else if (/\.(x?html?)$/i.test(relatif)) {
      const livre = await livreParId(droit.l);
      const m: any = livre?.manifeste;
      const permis = m?.type === "epub" ? m.pages.slice(0, droit.x).map((p: { href: string }) => p.href) : [];
      if (!permis.includes(relatif)) return new NextResponse("Extrait terminé", { status: 403 });
    }
  }

  const data = await (await stockage()).get(`livres/${droit.l}/${relatif}`);
  if (!data) return new NextResponse("Introuvable", { status: 404 });

  const ext = (relatif.split(".").pop() || "").toLowerCase();
  const type = TYPES[ext] || "application/octet-stream";
  const entetes: Record<string, string> = {
    "Content-Type": type,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Robots-Tag": "noindex",
    "Content-Disposition": "inline",
  };

  // Les polices sont demandées depuis l'iframe isolée (origine différente) : il faut l'autoriser
  if (["woff", "woff2", "ttf", "otf"].includes(ext)) entetes["Access-Control-Allow-Origin"] = "*";

  if (ext === "xhtml" || ext === "html" || ext === "htm") {
    let texte = await data.text();
    // Livre-application web : on garde son propre fonctionnement, on ajoute seulement la mémoire de lecture
    const script = relatif.startsWith("web/") ? SCRIPT_WEB : SCRIPT_CHAPITRE;
    const bloc = `<script>//<![CDATA[\n${script}\n//]]></script>`;
    texte = /<\/head>/i.test(texte) ? texte.replace(/<\/head>/i, `${bloc}</head>`) : bloc + texte;
    // Les pages sont affichées dans une iframe isolée : elles ne peuvent pas lire l'application.
    // Un livre web affiche ses propres pages dans des cadres imbriqués (origine isolée) : pas de restriction d'ancêtres.
    if (!relatif.startsWith("web/")) entetes["Content-Security-Policy"] = "frame-ancestors 'self'";
    return new NextResponse(texte, { headers: entetes });
  }
  return new NextResponse(data.body, { headers: entetes });
}
