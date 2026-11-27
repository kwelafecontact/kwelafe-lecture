"use client";
// Import d'un livre dans le navigateur de l'éditeur :
// - EPUB : décompressé ici, chaque fichier envoyé séparément vers le stockage privé ;
// - PDF : chaque page transformée en image ici, le PDF lui-même n'est jamais envoyé.
import { useState } from "react";
import { useRouter } from "next/navigation";
import JSZip from "jszip";
import { UNIVERS } from "@/lib/config";
import CATALOGUE from "@/lib/catalogue-shopify.json";

type FicheBoutique = { id: string; titre: string; univers: string; url: string; couverture: string | null; resume: string };
export const catalogue = CATALOGUE as FicheBoutique[];

// Packs et coffrets : un livre dont le titre contient l'un de ces mots est aussi débloqué par le pack
export const PACKS: { id: string; mots: RegExp }[] = [
  { id: "11046937297233", mots: /creole reunionnais tome (1|2)/ }, // Pack créole Tome I et II
  { id: "11387035812177", mots: /creole reunionnais tome (1|2)|guide indispensable du voyageur/ }, // Coffret Apprendre le créole
  { id: "10834500026705", mots: /100 proverbes expressions de la reunion volume (1|2)/ }, // Pack proverbes
  { id: "11051251892561", mots: /superstitions interdits reunionnais/ }, // Pack 150 superstitions
  { id: "11387035844945", mots: /superstitions interdits reunionnais|forces du mal|je vois ce qui vous suit|desenvouteur/ }, // Coffret Frissons péi
  { id: "11387035877713", mots: /kosa in shoz|sirandanes|premiers mots|abecedaire/ }, // Coffret Rire et apprendre
];
// Titre de base, sans la mention du format (PDF, EPUB…), pour retrouver les versions d'un même livre
export const base = (t: string) =>
  t.split("|")[0]
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/\d+\s*pages/g, "")
    .replace(/\b(epub|pdf|interactif|iphone|ipad|et)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();

type Envoi = { chemin: string; blob: Blob; type: string };

function resoudre(base: string, href: string) {
  const u = new URL(href, "http://livre/" + base);
  return decodeURIComponent(u.pathname.slice(1));
}
function dossier(chemin: string) {
  const i = chemin.lastIndexOf("/");
  return i >= 0 ? chemin.slice(0, i + 1) : "";
}
function typeMime(nom: string) {
  const ext = nom.split(".").pop()?.toLowerCase() || "";
  const t: Record<string, string> = { xhtml: "application/xhtml+xml", html: "text/html", css: "text/css", js: "text/javascript", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", mp3: "audio/mpeg", m4a: "audio/mp4", mp4: "video/mp4", woff2: "font/woff2", woff: "font/woff", ttf: "font/ttf", otf: "font/otf", json: "application/json" };
  return t[ext] || "application/octet-stream";
}

export async function televerser(envois: Envoi[], couverture: boolean, progression: (n: number) => void) {
  let faits = 0;
  let idx = 0;
  const zone = couverture ? "couvertures" : "livres";
  // 4 envois en parallèle, chaque morceau part séparément vers le stockage privé
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (idx < envois.length) {
        const e = envois[idx++];
        const r = await fetch(`/api/admin/fichier?zone=${zone}&chemin=${encodeURIComponent(e.chemin)}`, {
          method: "PUT",
          headers: { "Content-Type": e.type },
          body: e.blob,
        });
        if (!r.ok) throw new Error(`Envoi impossible : ${e.chemin}`);
        progression(++faits);
      }
    })
  );
}

export async function preparerEpub(fichier: File, id: string) {
  const zip = await JSZip.loadAsync(fichier);
  const container = await zip.file("META-INF/container.xml")?.async("text");
  if (!container) throw new Error("Ce fichier n'est pas un EPUB valide (container.xml absent).");
  const xml = (t: string) => new DOMParser().parseFromString(t, "application/xml");
  const opfChemin = xml(container).querySelector("rootfile")?.getAttribute("full-path");
  if (!opfChemin) throw new Error("EPUB sans fichier OPF.");
  const opf = xml(await zip.file(opfChemin)!.async("text"));
  const base = dossier(opfChemin);

  const items = new Map<string, { href: string; type: string; props: string }>();
  opf.querySelectorAll("manifest > item").forEach((it) => {
    items.set(it.getAttribute("id")!, { href: resoudre(base, it.getAttribute("href")!), type: it.getAttribute("media-type") || "", props: it.getAttribute("properties") || "" });
  });
  const spine = Array.from(opf.querySelectorAll("spine > itemref"))
    .filter((r) => r.getAttribute("linear") !== "no")
    .map((r) => items.get(r.getAttribute("idref")!)?.href)
    .filter(Boolean) as string[];
  const metas = Array.from(opf.querySelectorAll("metadata > meta"));
  const fixe = metas.some((mt) => mt.getAttribute("property") === "rendition:layout" && mt.textContent?.trim() === "pre-paginated");
  const titre = opf.getElementsByTagNameNS("*", "title")[0]?.textContent?.trim() || fichier.name.replace(/\.epub$/i, "");
  const interactif = [...items.values()].some((it) => it.props.includes("scripted"));

  // Taille des pages fixes (balise viewport de la première page)
  let largeur: number | undefined, hauteur: number | undefined;
  if (fixe && spine[0]) {
    const premiere = await zip.file(spine[0])?.async("text");
    const vp = premiere?.match(/name=["']viewport["'][^>]*content=["']([^"']+)["']/i)?.[1] || premiere?.match(/content=["']([^"']*width[^"']*)["'][^>]*name=["']viewport["']/i)?.[1];
    largeur = Number(vp?.match(/width\s*=\s*(\d+)/)?.[1]) || undefined;
    hauteur = Number(vp?.match(/height\s*=\s*(\d+)/)?.[1]) || undefined;
  }

  // Sommaire (nav EPUB 3, sinon NCX EPUB 2)
  const sommaire: { titre: string; index: number }[] = [];
  const nav = [...items.values()].find((it) => it.props.split(" ").includes("nav"));
  const ajouter = (t: string, href: string, depuis: string) => {
    const cible = resoudre(depuis, href).split("#")[0];
    const index = spine.indexOf(cible);
    if (index >= 0 && t) sommaire.push({ titre: t.trim().replace(/\s+/g, " "), index });
  };
  if (nav) {
    const doc = new DOMParser().parseFromString(await zip.file(nav.href)!.async("text"), "application/xhtml+xml");
    const toc = Array.from(doc.getElementsByTagName("nav")).find((n) => (n.getAttribute("epub:type") || n.getAttributeNS("http://www.idpf.org/2007/ops", "type")) === "toc") || doc.getElementsByTagName("nav")[0];
    toc?.querySelectorAll("a[href]").forEach((a) => ajouter(a.textContent || "", a.getAttribute("href")!, nav.href));
  } else {
    const ncx = [...items.values()].find((it) => it.type === "application/x-dtbncx+xml");
    if (ncx) {
      const doc = xml(await zip.file(ncx.href)!.async("text"));
      doc.querySelectorAll("navPoint").forEach((np) => ajouter(np.querySelector("text")?.textContent || "", np.querySelector("content")?.getAttribute("src") || "", ncx.href));
    }
  }

  // Couverture
  let couverture: Envoi | null = null;
  const idCouv = metas.find((mt) => mt.getAttribute("name") === "cover")?.getAttribute("content");
  const itCouv = [...items.values()].find((it) => it.props.includes("cover-image")) || (idCouv ? items.get(idCouv) : undefined);
  if (itCouv && zip.file(itCouv.href)) {
    const ext = itCouv.href.split(".").pop();
    couverture = { chemin: `${id}.${ext}`, blob: await zip.file(itCouv.href)!.async("blob"), type: itCouv.type || typeMime(itCouv.href) };
  }

  const envois: Envoi[] = [];
  for (const nom of Object.keys(zip.files)) {
    const f = zip.files[nom];
    if (f.dir || nom === "mimetype" || nom.startsWith("META-INF/") || nom.endsWith(".opf")) continue;
    envois.push({ chemin: `${id}/${nom}`, blob: await f.async("blob"), type: typeMime(nom) });
  }

  const titres = new Map(sommaire.map((s) => [s.index, s.titre]));
  const manifeste = { type: "epub" as const, fixe, largeur, hauteur, pages: spine.map((href, k) => ({ href, titre: titres.get(k) })), sommaire };
  return { titre, manifeste, envois, couverture, typeLivre: interactif ? "epub_interactif" : "epub_texte" };
}

export async function preparerPdf(fichier: File, id: string, etape: (t: string) => void) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await fichier.arrayBuffer()) }).promise;
  const envois: Envoi[] = [];
  let ratio = 1.414;
  let ext: "webp" | "jpg" = "webp";
  let couverture: Envoi | null = null;
  for (let n = 1; n <= doc.numPages; n++) {
    etape(`Préparation de la page ${n} sur ${doc.numPages}…`);
    const page = await doc.getPage(n);
    const v1 = page.getViewport({ scale: 1 });
    if (n === 1) ratio = v1.height / v1.width;
    const vp = page.getViewport({ scale: 1600 / v1.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp, canvas } as any).promise;
    let blob = await new Promise<Blob>((ok) => canvas.toBlob((b) => ok(b!), "image/webp", 0.82));
    if (blob.type !== "image/webp") {
      ext = "jpg"; // navigateur sans WebP (Safari) : on passe en JPEG
      blob = await new Promise<Blob>((ok) => canvas.toBlob((b) => ok(b!), "image/jpeg", 0.85));
    }
    if (n === 1) couverture = { chemin: `${id}.${ext}`, blob, type: blob.type };
    // Chaque page part tout de suite puis est libérée : un gros PDF ne sature plus la mémoire du navigateur
    const env = { chemin: `${id}/pdf/${n}.${ext}`, blob, type: blob.type };
    let essai = 0;
    while (true) {
      try { await televerser([env], false, () => {}); break; }
      catch (e) { if (++essai >= 3) throw new Error(`Page ${n} : envoi impossible après 3 essais`); await new Promise((r) => setTimeout(r, 1500 * essai)); }
    }
    canvas.width = 0; canvas.height = 0;
    page.cleanup();
  }
  try { await (doc as any).destroy?.(); } catch {}
  return { titre: fichier.name.replace(/\.pdf$/i, ""), manifeste: { type: "pdf" as const, pages: doc.numPages, ratio, ext }, envois, couverture, typeLivre: "pdf" };
}

// Livre-application web (.zip avec un index.html) : tous les fichiers partent dans livres/{id}/web/
export async function preparerWeb(fichier: File, id: string) {
  const zip = await JSZip.loadAsync(fichier);
  const noms = Object.keys(zip.files).filter((n) => !zip.files[n].dir && !/(^|\/)(__MACOSX|\.DS_Store)/.test(n));
  const index = noms.filter((n) => /(^|\/)index\.html?$/i.test(n)).sort((a, b) => a.length - b.length)[0];
  if (!index) throw new Error("Ce fichier .zip ne contient pas de page index.html : ce n'est pas un livre web.");
  const racine = dossier(index);
  const envois: Envoi[] = [];
  for (const n of noms) {
    if (!n.startsWith(racine)) continue;
    const rel = n.slice(racine.length);
    envois.push({ chemin: `${id}/web/${rel}`, blob: await zip.files[n].async("blob"), type: typeMime(n) });
  }
  const html = await zip.files[index].async("string");
  const titre = (html.match(/<title>([^<]*)<\/title>/i)?.[1] || fichier.name.replace(/\.zip$/i, ""))
    .split(/\s[·|–-]\s/)[0].trim();
  const pages = (html.match(/"f"\s*:\s*"[^"]+\.x?html"/g) || []).length || undefined;
  // Couverture : une image nommée « couverture » ou « cover » dans le livre
  const nomCouv = noms.find((n) => /(^|\/)(couverture|cover)\.(jpe?g|png|webp)$/i.test(n));
  const couverture = nomCouv
    ? { chemin: `${id}.${nomCouv.split(".").pop()!.toLowerCase()}`, blob: await zip.files[nomCouv].async("blob"), type: typeMime(nomCouv) }
    : null;
  return { titre, manifeste: { type: "web" as const, entree: `web/${index.slice(racine.length)}`, pages }, envois, couverture, typeLivre: "epub_interactif" };
}

export default function ImportLivre() {
  const router = useRouter();
  const [fichier, setFichier] = useState<File | null>(null);
  const [couvPerso, setCouvPerso] = useState<File | null>(null);
  const [titre, setTitre] = useState("");
  const [resume, setResume] = useState("");
  const [univers, setUnivers] = useState<string>(UNIVERS[0].id);
  const [produit, setProduit] = useState("");
  const [urlBoutique, setUrlBoutique] = useState("");
  const [inclus, setInclus] = useState(true);
  const [interactifForce, setInteractifForce] = useState<"auto" | "oui" | "non">("auto");
  const [ficheId, setFicheId] = useState("");
  const [couvBoutique, setCouvBoutique] = useState<string | null>(null);
  const [etat, setEtat] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  // Choix d'un livre de la boutique : remplit le formulaire et relie toutes ses versions (PDF, EPUB…)
  function choisirFiche(id: string) {
    setFicheId(id);
    const f = catalogue.find((x) => x.id === id);
    if (!f) return;
    const versions = catalogue.filter((x) => base(x.titre) === base(f.titre));
    setTitre(f.titre.split(/\s\|\s/)[0].trim());
    setResume(f.resume);
    setUnivers(f.univers);
    setUrlBoutique(f.url);
    setCouvBoutique(f.couverture);
    const ids = versions.map((v) => v.id.split("/").pop()!);
    for (const p of PACKS) if (p.mots.test(base(f.titre)) && !ids.includes(p.id)) ids.push(p.id);
    setProduit(ids.join(", "));
  }

  async function importer(e: React.FormEvent) {
    e.preventDefault();
    if (!fichier) return;
    setEnCours(true);
    setErreur("");
    try {
      const id = crypto.randomUUID();
      setEtat("Lecture du fichier…");
      const estPdf = /\.pdf$/i.test(fichier.name);
      const estZip = /\.zip$/i.test(fichier.name);
      const r = estPdf ? await preparerPdf(fichier, id, setEtat) : estZip ? await preparerWeb(fichier, id) : await preparerEpub(fichier, id);
      let typeLivre = r.typeLivre;
      if (!estPdf && !estZip && interactifForce !== "auto") typeLivre = interactifForce === "oui" ? "epub_interactif" : "epub_texte";

      setEtat(`Envoi des ${r.envois.length} morceaux du livre…`);
      await televerser(r.envois, false, (n) => setEtat(`Envoi : ${n} / ${r.envois.length}`));

      let cheminCouv: string | null = couvPerso || r.couverture ? null : couvBoutique;
      const couv = couvPerso
        ? { chemin: `${id}.${couvPerso.name.split(".").pop()}`, blob: couvPerso as Blob, type: couvPerso.type }
        : r.couverture;
      if (couv) {
        setEtat("Envoi de la couverture…");
        await televerser([couv], true, () => {});
        cheminCouv = couv.chemin;
      }

      setEtat("Enregistrement du livre…");
      const rep = await fetch("/api/admin/livres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, titre: titre || r.titre, resume, univers, type: typeLivre, produit, url_boutique: urlBoutique, inclus_abonnement: inclus, couverture: cheminCouv, manifeste: r.manifeste }),
      });
      const j = await rep.json();
      if (!rep.ok) throw new Error(j.erreur || "Enregistrement impossible");
      setEtat(`C'est fait ! « ${titre || r.titre} » est enregistré en brouillon. Prévisualise-le, puis publie-le.`);
      setFichier(null); setCouvPerso(null); setTitre(""); setResume(""); setProduit(""); setUrlBoutique(""); setFicheId(""); setCouvBoutique(null);
      router.refresh();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err));
      setEtat("");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form className="formulaire" onSubmit={importer}>
      <label>1. Choisis le livre dans ta boutique (remplit tout automatiquement)
        <select value={ficheId} onChange={(e) => choisirFiche(e.target.value)}>
          <option value="">— Livre de la boutique —</option>
          {catalogue.map((f) => <option key={f.id} value={f.id}>{f.titre}</option>)}
        </select>
      </label>
      {couvBoutique && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={couvBoutique} alt="Couverture de la boutique" style={{ width: 110, borderRadius: 8, boxShadow: "var(--ombre)" }} />
      )}
      <label>2. Fichier du livre (EPUB, PDF, ou .zip d'un livre web interactif)
        <input type="file" accept=".epub,.pdf,.zip,application/epub+zip,application/pdf,application/zip" onChange={(e) => setFichier(e.target.files?.[0] || null)} required />
      </label>
      <label>Titre (laisser vide pour reprendre celui du fichier)
        <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} />
      </label>
      <label>Résumé court
        <textarea rows={3} value={resume} onChange={(e) => setResume(e.target.value)} />
      </label>
      <label>Univers
        <select value={univers} onChange={(e) => setUnivers(e.target.value)}>
          {UNIVERS.map((u) => <option key={u.id} value={u.id}>{u.nom}</option>)}
        </select>
      </label>
      <label>Livre interactif ?
        <select value={interactifForce} onChange={(e) => setInteractifForce(e.target.value as any)}>
          <option value="auto">Détection automatique</option>
          <option value="oui">Oui, livre interactif</option>
          <option value="non">Non, livre classique</option>
        </select>
      </label>
      <label>Produits Shopify qui donnent accès à ce livre (PDF, EPUB, packs, coffrets… séparés par des virgules)
        <input type="text" value={produit} onChange={(e) => setProduit(e.target.value)} placeholder="https://admin.shopify.com/store/…/products/1234567890" />
      </label>
      <label>Lien public de la fiche sur la boutique (pour le bouton « Découvrir »)
        <input type="url" value={urlBoutique} onChange={(e) => setUrlBoutique(e.target.value)} placeholder="https://kwelafeproduction.com/products/…" />
      </label>
      <label>Couverture (facultatif, sinon prise dans le fichier)
        <input type="file" accept="image/*" onChange={(e) => setCouvPerso(e.target.files?.[0] || null)} />
      </label>
      <label className="case"><input type="checkbox" checked={inclus} onChange={(e) => setInclus(e.target.checked)} /> Inclus dans l'abonnement</label>
      <button className="btn" disabled={enCours || !fichier}>{enCours ? "Import en cours…" : "Importer le livre"}</button>
      {etat && <div className="message ok">{etat}</div>}
      {erreur && <div className="message erreur">{erreur}</div>}
      <p className="texte-doux" style={{ fontSize: 14 }}>Conseil : fais l'import depuis Chrome sur ordinateur, c'est plus rapide pour les gros PDF.</p>
    </form>
  );
}
