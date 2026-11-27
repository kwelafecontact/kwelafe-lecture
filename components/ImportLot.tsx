"use client";
// Import de la bibliothèque en lot. Chaque fichier choisi devient une ligne où l'on vérifie, avant d'importer :
// la fiche Shopify reliée (proposée automatiquement, modifiable), le titre affiché, l'univers, et si on l'importe.
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LOT from "@/lib/import-lot.json";
import { UNIVERS } from "@/lib/config";
import { televerser, preparerEpub, preparerPdf, catalogue, PACKS, base } from "./ImportLivre";

type Produit = { id: string; titre: string; url: string | null; couverture: string | null };
type Verifie = { fichier: string; titre: string; univers: string; produits: string[]; couverture: string | null; resume: string; url: string | null; interactif: boolean };
type Ligne = { fichier: string; format: "pdf" | "epub"; garder: boolean; produit: string; titre: string; univers: string; resume: string; interactif: boolean; deja: boolean; doublon?: string };
type Etat = { etat: "attente" | "en cours" | "fait" | "erreur"; detail?: string };
const verifies = LOT as Verifie[];

const cle = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 28);
const mots = (t: string) => new Set(base(t).split(" ").filter((m) => m.length > 2));
const nomPropre = (t: string) => t.split(/\s[|•]\s/)[0].replace(/\s[—-]\s?(PDF|EPUB.*)$/i, "").trim();
const nettoyer = (nom: string) => nom.replace(/\.(pdf|epub)$/i, "").replace(/[_]+/g, " ")
  .replace(/\(\d+\)/g, " ").replace(/\b(ipad|iphone|premium|pdf|epub|numerique|final|fixed layout|300dpi|kdp|6x9|nb|illustre|graphie academie|v\d+|a4)\b/gi, " ")
  .replace(/\s+/g, " ").trim();

// Fiche de la boutique la plus proche du nom du fichier (0 à 1)
function meilleureFiche(nom: string, produits: Produit[]) {
  const m = mots(nettoyer(nom));
  let best: Produit | null = null, score = 0;
  for (const p of produits) {
    if (/coffret|pack/i.test(p.titre)) continue;
    const mp = mots(p.titre); let k = 0; m.forEach((x) => mp.has(x) && k++);
    const s = k / Math.max(3, Math.min(m.size, mp.size));
    if (s > score) { score = s; best = p; }
  }
  return score >= 0.5 ? best : null;
}
// Une seule version par livre : l'iPad plutôt que l'iPhone, le PDF numérique plutôt que le PDF papier KDP
function doublonDe(nom: string, noms: string[]) {
  const bas = nom.toLowerCase();
  if (bas.includes("iphone") && noms.some((n) => n.toLowerCase() === bas.replace("iphone", "ipad"))) return "version iPhone (l'iPad est importé)";
  if (/kdp/i.test(nom) && noms.some((n) => /numerique/i.test(n) && cle(nettoyer(n)) === cle(nettoyer(nom)))) return "PDF papier KDP (le PDF numérique est importé)";
  return undefined;
}

export default function ImportLot({ dejaImportes, produitsImportes }: { dejaImportes: string[]; produitsImportes: string[] }) {
  const router = useRouter();
  const [produits, setProduits] = useState<Produit[]>(catalogue.map((c) => ({ id: c.id.split("/").pop()!, titre: c.titre, url: c.url, couverture: c.couverture })));
  const [fichiers, setFichiers] = useState<Map<string, File>>(new Map());
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [etats, setEtats] = useState<Record<string, Etat>>({});
  const [enCours, setEnCours] = useState(false);
  const [filtre, setFiltre] = useState("");

  // Liste à jour des fiches de la boutique
  useEffect(() => { fetch("/api/admin/produits").then((r) => r.json()).then((j) => j.produits?.length && setProduits(j.produits)).catch(() => {}); }, []);

  const deja = useMemo(() => new Set(dejaImportes.map((x) => { const [f, ...t] = x.split("|"); return `${f}|${cle(t.join("|"))}`; })), [dejaImportes]);
  const produitsDeja = useMemo(() => new Set(produitsImportes.flatMap((x) => { const [f, p] = x.split("|"); return (p || "").split(",").filter(Boolean).map((id) => `${f}|${id.trim().split("/").pop()}`); })), [produitsImportes]);

  function construire(m: Map<string, File>, prods: Produit[]) {
    const noms = [...m.keys()].filter((n) => /\.(pdf|epub)$/i.test(n));
    return noms.sort((a, b) => a.localeCompare(b, "fr")).map<Ligne>((n) => {
      const format = /\.pdf$/i.test(n) ? "pdf" : "epub";
      const v = verifies.find((e) => e.fichier === n);
      const f = v ? prods.find((p) => v.produits.includes(p.id)) || null : meilleureFiche(n, prods);
      const titre = v?.titre || (f ? nomPropre(f.titre) : nettoyer(n).replace(/^./, (c) => c.toUpperCase()));
      const ancien = catalogue.find((c) => f && c.id.endsWith(f.id));
      const doublon = doublonDe(n, noms);
      const estDeja = deja.has(`${format}|${cle(titre)}`) || (!!f && produitsDeja.has(`${format}|${f.id}`));
      return { fichier: n, format, garder: !doublon && !estDeja, produit: f?.id || "", titre, univers: v?.univers || ancien?.univers || "creole", resume: v?.resume || ancien?.resume || "", interactif: v?.interactif || false, deja: estDeja, doublon };
    });
  }
  function choisir(liste: FileList | null) {
    const m = new Map(fichiers);
    for (const f of Array.from(liste || [])) if (!m.has(f.name)) m.set(f.name, f);
    setFichiers(m);
    setLignes(construire(m, produits));
  }
  const maj = (fichier: string, champ: Partial<Ligne>) => setLignes((ls) => ls.map((l) => (l.fichier === fichier ? { ...l, ...champ } : l)));
  function changerFiche(l: Ligne, id: string) {
    const p = produits.find((x) => x.id === id);
    const ancien = catalogue.find((c) => c.id.endsWith(id));
    maj(l.fichier, { produit: id, titre: p ? nomPropre(p.titre) : l.titre, univers: ancien?.univers || l.univers, resume: ancien?.resume || l.resume });
  }

  async function toutImporter() {
    setEnCours(true);
    for (const l of lignes.filter((x) => x.garder)) {
      if (etats[l.fichier]?.etat === "fait") continue;
      const met = (etat: Etat["etat"], detail?: string) => setEtats((x) => ({ ...x, [l.fichier]: { etat, detail } }));
      try {
        met("en cours", "lecture du fichier…");
        const f = fichiers.get(l.fichier)!;
        const id = crypto.randomUUID();
        const r = l.format === "pdf" ? await preparerPdf(f, id, (t) => met("en cours", t)) : await preparerEpub(f, id);
        if (r.envois.length) await televerser(r.envois, false, (n) => met("en cours", `envoi ${n} / ${r.envois.length}`));
        const p = produits.find((x) => x.id === l.produit);
        let couverture: string | null = p?.couverture || null;
        if (r.couverture) { await televerser([r.couverture], true, () => {}); couverture = r.couverture.chemin; }
        // Fiche choisie + toutes les versions du même livre + packs et coffrets qui le contiennent
        const ids = new Set<string>(l.produit ? [l.produit] : []);
        if (p) for (const x of produits) if (base(x.titre) === base(p.titre)) ids.add(x.id);
        for (const k of PACKS) if (k.mots.test(base(l.titre))) ids.add(k.id);
        const rep = await fetch("/api/admin/livres", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, titre: l.titre, resume: l.resume, univers: l.univers, type: l.format === "pdf" ? "pdf" : l.interactif ? "epub_interactif" : r.typeLivre, produit: [...ids].join(","), url_boutique: p?.url || null, inclus_abonnement: true, couverture, manifeste: r.manifeste }),
        });
        if (!rep.ok) throw new Error((await rep.json()).erreur || "enregistrement refusé");
        await fetch("/api/admin/livres", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, champ: "publie", valeur: true }) });
        met("fait");
      } catch (err) { met("erreur", err instanceof Error ? err.message : String(err)); }
    }
    setEnCours(false);
    router.refresh();
  }

  const aImporter = lignes.filter((l) => l.garder && etats[l.fichier]?.etat !== "fait").length;
  const sansFiche = lignes.filter((l) => l.garder && !l.produit).length;
  const visibles = lignes.filter((l) => !filtre || (l.fichier + l.titre).toLowerCase().includes(filtre.toLowerCase()));

  return (
    <div className="formulaire">
      <p className="texte-doux" style={{ margin: 0 }}>
        Choisis tes dossiers de livres (PDF et EPUB). Pour chaque fichier, l'app propose la fiche de la boutique qui lui ressemble le plus :
        vérifie-la, corrige le titre ou l'univers si besoin, puis importe. Les versions iPhone, les PDF papier KDP et les livres déjà dans l'app sont décochés d'office.
      </p>
      <label>Choisir des fichiers
        <input type="file" multiple accept=".epub,.pdf" onChange={(ev) => choisir(ev.target.files)} disabled={enCours} />
      </label>
      <label>… ou un dossier entier (tu peux en ajouter plusieurs, ils s'additionnent)
        {/* @ts-expect-error : attribut non standard pour choisir un dossier entier */}
        <input type="file" webkitdirectory="" multiple onChange={(ev) => choisir(ev.target.files)} disabled={enCours} />
      </label>

      {lignes.length > 0 && (
        <>
          <div className="resume-import">
            <span><b>{lignes.length}</b> fichiers</span>
            <span>✅ <b>{aImporter}</b> à importer</span>
            {sansFiche > 0 && <span className="alerte-import">⚠️ <b>{sansFiche}</b> sans fiche boutique</span>}
            <span>{produits.length} fiches boutique disponibles</span>
            <input placeholder="Rechercher un fichier…" value={filtre} onChange={(e) => setFiltre(e.target.value)} />
          </div>
          <div className="table-import">
            <table className="tableau">
              <thead><tr><th></th><th>Fichier sur ton ordinateur</th><th>Fiche de la boutique</th><th>Titre dans l'app</th><th>Univers</th><th>État</th></tr></thead>
              <tbody>
                {visibles.map((l) => {
                  const s = etats[l.fichier];
                  const fige = enCours || s?.etat === "fait";
                  return (
                    <tr key={l.fichier} className={!l.garder ? "ligne-ecartee" : !l.produit ? "ligne-sans-fiche" : ""}>
                      <td><input type="checkbox" checked={l.garder} disabled={fige} onChange={(e) => maj(l.fichier, { garder: e.target.checked })} aria-label="Importer ce fichier" /></td>
                      <td className="cell-fichier">
                        <span className={`badge-format ${l.format}`}>{l.format.toUpperCase()}</span> {l.fichier}
                        {l.doublon && <small>↳ {l.doublon}</small>}
                        {l.deja && <small>↳ déjà dans l'app dans ce format</small>}
                      </td>
                      <td>
                        <select value={l.produit} disabled={fige} onChange={(e) => changerFiche(l, e.target.value)}>
                          <option value="">— Aucune fiche (livre sans vente à l'unité) —</option>
                          {produits.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}
                        </select>
                      </td>
                      <td><input value={l.titre} disabled={fige} onChange={(e) => maj(l.fichier, { titre: e.target.value })} /></td>
                      <td>
                        <select value={l.univers} disabled={fige} onChange={(e) => maj(l.fichier, { univers: e.target.value })}>
                          {UNIVERS.map((u) => <option key={u.id} value={u.id}>{u.nom}</option>)}
                        </select>
                      </td>
                      <td className={`etat-import ${s?.etat || ""}`}>
                        {s?.etat === "fait" ? "✓ importé" : s?.etat === "erreur" ? `✗ ${s.detail}` : s?.etat === "en cours" ? s.detail : l.garder ? "prêt" : "écarté"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="btn" onClick={toutImporter} disabled={enCours || aImporter === 0} type="button">
            {enCours ? "Import en cours… garde cette page ouverte" : aImporter ? `Importer les ${aImporter} livres cochés` : "Tout est importé"}
          </button>
        </>
      )}
    </div>
  );
}
