"use client";
// Import de toute la bibliothèque en une fois : l'éditeur choisit le dossier « Livres final pdf »,
// l'app reconnaît chaque livre par le nom de son fichier, le relie à ses fiches Shopify et l'importe.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LOT from "@/lib/import-lot.json";
import { televerser, preparerEpub, preparerPdf } from "./ImportLivre";

type Entree = { fichier: string; titre: string; univers: string; produits: string[]; couverture: string | null; resume: string; url: string | null; interactif: boolean };
const lot = LOT as Entree[];
type Etat = "attente" | "en cours" | "fait" | "erreur" | "déjà là";

// Titre simplifié pour reconnaître un livre déjà présent même si son titre est un peu différent
const cle = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 28);

export default function ImportLot({ dejaImportes, produitsImportes }: { dejaImportes: string[]; produitsImportes: string[] }) {
  const router = useRouter();
  const [fichiers, setFichiers] = useState<Map<string, File>>(new Map());
  const [etats, setEtats] = useState<Record<string, { etat: Etat; detail?: string }>>({});
  const [enCours, setEnCours] = useState(false);

  const trouves = useMemo(() => lot.filter((e) => fichiers.has(e.fichier)), [fichiers]);
  const deja = new Set(dejaImportes.map(cle));
  const produitsDeja = new Set(produitsImportes.flatMap((p) => p.split(",")).map((p) => p.trim().split("/").pop()));
  const estDeja = (l: Entree) => deja.has(cle(l.titre)) || l.produits.slice(0, 2).some((p) => produitsDeja.has(p));

  function choisir(liste: FileList | null) {
    const m = new Map<string, File>(fichiers); // on ajoute aux fichiers déjà choisis
    for (const f of Array.from(liste || [])) if (!m.has(f.name)) m.set(f.name, f);
    setFichiers(m);
    const e: typeof etats = {};
    for (const l of lot) if (m.has(l.fichier)) e[l.fichier] = { etat: estDeja(l) ? "déjà là" : "attente" };
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
        Choisis le dossier <b>« Livres final pdf »</b> sur ton bureau. L'app reconnaît automatiquement les {lot.length} livres dont la version est vérifiée,
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
          <p style={{ margin: 0 }}><b>{trouves.length}</b> livres reconnus sur {lot.length}.</p>
          <table className="tableau">
            <tbody>
              {trouves.map((e) => {
                const s = etats[e.fichier];
                return (
                  <tr key={e.fichier}>
                    <td>{e.titre}</td>
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
