"use client";
// Import de toute la bibliothèque en une fois : l'éditeur choisit le dossier « Livres final pdf »,
// l'app reconnaît chaque livre par le nom de son fichier, le relie à ses fiches Shopify et l'importe.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LOT from "@/lib/import-lot.json";
import { televerser, preparerEpub, preparerPdf, catalogue, PACKS, base } from "./ImportLivre";

type Entree = { fichier: string; titre: string; univers: string; produits: string[]; couverture: string | null; resume: string; url: string | null; interactif: boolean; nouveau?: boolean };

// Fichier absent de la liste vérifiée : on devine le titre à partir du nom et on cherche la fiche de la boutique
const mots = (t: string) => new Set(base(t).split(" ").filter((m) => m.length > 2));
function deviner(nom: string): Entree {
  const brut = nom.replace(/\.(pdf|epub)$/i, "").replace(/[_]+/g, " ")
    .replace(/\b(ipad|iphone|premium|pdf|epub|numerique|final|fixed layout|300dpi|kdp|6x9|nb|illustre|graphie academie|v\d+)\b/gi, " ")
    .replace(/\s+/g, " ").trim();
  const m = mots(brut);
  let meilleure: (typeof catalogue)[number] | null = null, score = 0;
  for (const c of catalogue) {
    if (/coffret|pack|carte cadeau|abonnement/i.test(c.titre)) continue;
    const mc = mots(c.titre); let k = 0; m.forEach((x) => mc.has(x) && k++);
    const sc = k / Math.max(3, Math.min(m.size, mc.size));
    if (sc > score) { score = sc; meilleure = c; }
  }
  const f = score >= 0.6 ? meilleure : null;
  const titre = f ? f.titre.split(/\s[|•]\s|\s:\s/)[0].trim() : brut.charAt(0).toUpperCase() + brut.slice(1);
  const ids = f ? catalogue.filter((x) => base(x.titre) === base(f.titre)).map((v) => v.id.split("/").pop()!) : [];
  for (const p of PACKS) if (p.mots.test(base(titre)) && !ids.includes(p.id)) ids.push(p.id);
  return { fichier: nom, titre, univers: f?.univers || "creole", produits: ids, couverture: f?.couverture || null, resume: f?.resume || "", url: f?.url || null, interactif: false, nouveau: true };
}
// Une seule version par livre : on écarte l'iPhone si l'iPad est là, et le PDF papier KDP si le PDF numérique est là
function aGarder(nom: string, tous: Set<string>) {
  if (!/\.(pdf|epub)$/i.test(nom)) return false;
  if (/iphone/i.test(nom) && tous.has(nom.replace(/iphone/i, "iPad")) ) return false;
  if (/iphone/i.test(nom) && [...tous].some((n) => n.toLowerCase() === nom.toLowerCase().replace("iphone", "ipad"))) return false;
  if (/kdp/i.test(nom) && [...tous].some((n) => /pdf_numerique|numerique\.pdf/i.test(n) && n.split(/_kdp/i)[0] === nom.split(/_kdp/i)[0])) return false;
  return true;
}
const lot = LOT as Entree[];
type Etat = "attente" | "en cours" | "fait" | "erreur" | "déjà là";

// Titre simplifié pour reconnaître un livre déjà présent même si son titre est un peu différent
const cle = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 28);

export default function ImportLot({ dejaImportes, produitsImportes }: { dejaImportes: string[]; produitsImportes: string[] }) {
  const router = useRouter();
  const [fichiers, setFichiers] = useState<Map<string, File>>(new Map());
  const [etats, setEtats] = useState<Record<string, { etat: Etat; detail?: string }>>({});
  const [enCours, setEnCours] = useState(false);

  // Livres de la liste vérifiée + tous les autres fichiers choisis (titre deviné, fiche boutique cherchée)
  const trouves = useMemo(() => {
    const connus = lot.filter((e) => fichiers.has(e.fichier));
    const noms = new Set(fichiers.keys());
    const autres = [...noms].filter((n) => !lot.some((e) => e.fichier === n) && aGarder(n, noms)).map(deviner);
    return [...connus, ...autres];
  }, [fichiers]);
  // Un même livre peut exister en PDF et en EPUB : on ne saute que s'il est déjà là dans le même format
  const formatFichier = (nom: string) => (/\.pdf$/i.test(nom) ? "pdf" : /\.zip$/i.test(nom) ? "interactif" : "epub");
  const deja = new Set(dejaImportes.map((x) => { const [f, ...t] = x.split("|"); return `${f}|${cle(t.join("|"))}`; }));
  const produitsDeja = new Set(produitsImportes.flatMap((x) => { const [f, p] = x.split("|"); return (p || "").split(",").filter(Boolean).map((id) => `${f}|${id.trim().split("/").pop()}`); }));
  const estDeja = (l: Entree) => {
    const f = formatFichier(l.fichier);
    return deja.has(`${f}|${cle(l.titre)}`) || l.produits.slice(0, 2).some((p) => produitsDeja.has(`${f}|${p}`));
  };

  function choisir(liste: FileList | null) {
    const m = new Map<string, File>(fichiers); // on ajoute aux fichiers déjà choisis
    for (const f of Array.from(liste || [])) if (!m.has(f.name)) m.set(f.name, f);
    setFichiers(m);
    const e: typeof etats = {};
    const noms = new Set(m.keys());
    for (const l of lot) if (m.has(l.fichier)) e[l.fichier] = { etat: estDeja(l) ? "déjà là" : "attente" };
    for (const n of noms) if (!lot.some((l) => l.fichier === n) && aGarder(n, noms)) { const d = deviner(n); e[n] = { etat: estDeja(d) ? "déjà là" : "attente" }; }
    setEtats(e);
  }

  async function toutImporter() {
    setEnCours(true);
    for (const e of trouves) {
      if (etats[e.fichier]?.etat === "déjà là" || etats[e.fichier]?.etat === "fait") continue;
      const maj = (etat: Etat, detail?: string) => setEtats((x) => ({ ...x, [e.fichier]: { etat, detail } }));
      try {
        maj("en cours", "lecture du fichier…");
        const f = fichiers.get(e.fichier)!;
        const id = crypto.randomUUID();
        const estPdf = /\.pdf$/i.test(f.name);
        const r = estPdf ? await preparerPdf(f, id, (t) => maj("en cours", t)) : await preparerEpub(f, id);
        await televerser(r.envois, false, (n) => maj("en cours", `envoi ${n} / ${r.envois.length}`));
        // Couverture du fichier lui-même (toujours à jour), sinon celle de la boutique
        let couverture: string | null = e.couverture;
        if (r.couverture) {
          await televerser([r.couverture], true, () => {});
          couverture = r.couverture.chemin;
        }
        const rep = await fetch("/api/admin/livres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id, titre: e.titre, resume: e.resume, univers: e.univers,
            type: estPdf ? "pdf" : e.interactif ? "epub_interactif" : r.typeLivre,
            produit: e.produits.join(","), url_boutique: e.url, inclus_abonnement: true, couverture, manifeste: r.manifeste,
          }),
        });
        if (!rep.ok) throw new Error((await rep.json()).erreur || "enregistrement refusé");
        await fetch("/api/admin/livres", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, champ: "publie", valeur: true }) });
        maj("fait");
      } catch (err) {
        maj("erreur", err instanceof Error ? err.message : String(err));
      }
    }
    setEnCours(false);
    router.refresh();
  }

  const restants = trouves.filter((e) => !["déjà là", "fait"].includes(etats[e.fichier]?.etat)).length;

  return (
    <div className="formulaire">
      <p className="texte-doux" style={{ margin: 0 }}>
        Choisis le dossier <b>« Livres final pdf »</b> sur ton bureau. L'app importe tous les livres choisis (PDF et EPUB) : les {lot.length} livres vérifiés et tous les autres,
        prend la meilleure version (EPUB iPad), et les relie à leurs fiches Shopify, packs et coffrets.
      </p>
      <label>Choisir les fichiers (ouvre le dossier, puis Ctrl + A pour tout sélectionner)
        <input type="file" multiple accept=".epub,.pdf" onChange={(ev) => choisir(ev.target.files)} disabled={enCours} />
      </label>
      <label>… ou choisir un dossier entier
        {/* @ts-expect-error : attribut non standard pour choisir un dossier entier */}
        <input type="file" webkitdirectory="" multiple onChange={(ev) => choisir(ev.target.files)} disabled={enCours} />
      </label>
      {fichiers.size > 0 && (
        <>
          <p style={{ margin: 0 }}><b>{trouves.length}</b> livres trouvés ({trouves.filter((t) => t.nouveau).length} hors liste vérifiée : titre deviné à partir du nom du fichier, à vérifier après l'import). Les versions iPhone et KDP en double sont écartées.</p>
          <table className="tableau">
            <tbody>
              {trouves.map((e) => {
                const s = etats[e.fichier];
                return (
                  <tr key={e.fichier}>
                    <td>{e.titre}{e.nouveau && <small className="texte-doux"> · {e.fichier}{e.url ? " · fiche boutique trouvée" : " · sans fiche boutique"}</small>}</td>
                    <td style={{ whiteSpace: "nowrap", color: s?.etat === "erreur" ? "var(--lave)" : s?.etat === "fait" ? "#4d5d43" : "var(--doux)" }}>
                      {s?.etat === "fait" ? "✓ importé" : s?.etat === "déjà là" ? "déjà dans l'app" : s?.etat === "erreur" ? `✗ ${s.detail}` : s?.etat === "en cours" ? s.detail : "en attente"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="btn" onClick={toutImporter} disabled={enCours || restants === 0} type="button">
            {enCours ? "Import en cours… garde cette page ouverte" : restants ? `Importer les ${restants} livres` : "Tout est importé"}
          </button>
        </>
      )}
    </div>
  );
}
