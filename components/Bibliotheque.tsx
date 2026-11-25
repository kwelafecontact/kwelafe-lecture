"use client";
// Rayons de livres : EPUB, PDF et Interactifs, sans jamais montrer deux fois le même livre dans un rayon.
import { useMemo, useState } from "react";
import Link from "next/link";
import CarteLivre from "./CarteLivre";
import type { Livre } from "@/lib/donnees";
import { FORMATS, formatDe, sansDoublon, type Format } from "@/lib/formats";
import { UNIVERS } from "@/lib/config";
import { PUBLICS, publicsDe, collectionDe, cleCollection, type Public } from "@/lib/organisation";

export type ItemBiblio = { livre: Livre; acces: boolean; pourcentage: number; termine: boolean; favori: boolean };

const ETATS = [
  { id: "tous", nom: "Tous" },
  { id: "encours", nom: "En cours" },
  { id: "termines", nom: "Terminés" },
  { id: "favoris", nom: "❤ Favoris" },
] as const;
const TRIS = [
  { id: "recents", nom: "Les plus récents" },
  { id: "titre", nom: "Par titre (A → Z)" },
  { id: "progression", nom: "Par progression" },
] as const;

const normal = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Bibliotheque({
  items,
  mode,
  formatInitial = "tous",
  universInitial = "",
}: {
  items: ItemBiblio[];
  mode: "catalogue" | "mes";
  formatInitial?: Format | "tous";
  universInitial?: string;
}) {
  const [format, setFormat] = useState<Format | "tous">(formatInitial);
  const [univers, setUnivers] = useState(universInitial);
  const [pourQui, setPourQui] = useState<Public | "">("");
  const [etat, setEtat] = useState<(typeof ETATS)[number]["id"]>("tous");
  const [tri, setTri] = useState<(typeof TRIS)[number]["id"]>("recents");
  const [q, setQ] = useState("");

  const filtres = useMemo(() => {
    const t = normal(q.trim());
    let l = items.filter((i) => {
      if (t && !normal(i.livre.titre + " " + (i.livre.resume || "")).includes(t)) return false;
      if (univers && i.livre.univers !== univers) return false;
      if (pourQui && !publicsDe(i.livre).includes(pourQui)) return false;
      if (etat === "encours" && !(i.pourcentage > 0 && !i.termine)) return false;
      if (etat === "termines" && !i.termine) return false;
      if (etat === "favoris" && !i.favori) return false;
      return true;
    });
    if (tri === "titre") l = [...l].sort((a, b) => a.livre.titre.localeCompare(b.livre.titre, "fr"));
    if (tri === "progression") l = [...l].sort((a, b) => b.pourcentage - a.pourcentage);
    return l;
  }, [items, q, univers, etat, tri, pourQui]);

  // Collections : les livres en plusieurs tomes, regroupés (une carte par tome, un seul format)
  const collections = useMemo(() => {
    const m = new Map<string, { nom: string; tomes: Map<number, ItemBiblio> }>();
    for (const i of filtres) {
      const c = collectionDe(i.livre.titre);
      if (!c) continue;
      const k = cleCollection(c.nom);
      if (!m.has(k)) m.set(k, { nom: c.nom, tomes: new Map() });
      const g = m.get(k)!;
      const deja = g.tomes.get(c.tome);
      // on garde le format auquel le lecteur a accès, l'EPUB de préférence
      if (!deja || (!deja.acces && i.acces) || (deja.acces === i.acces && formatDe(i.livre) === "epub")) g.tomes.set(c.tome, i);
    }
    return [...m.values()].filter((g) => g.tomes.size >= 2).map((g) => ({ nom: g.nom, liste: [...g.tomes.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]) }));
  }, [filtres]);

  // Un rayon par format, chaque livre une seule fois par rayon
  const rayons = useMemo(() => {
    const acces = new Map(items.map((i) => [i.livre.id, i.acces]));
    return FORMATS.map((f) => {
      const duFormat = filtres.filter((i) => formatDe(i.livre) === f.id);
      const gardes = new Set(sansDoublon(duFormat.map((i) => i.livre), acces).map((l) => l.id));
      return { f, liste: duFormat.filter((i) => gardes.has(i.livre.id)) };
    });
  }, [filtres, items]);

  const compte = (id: Format) => rayons.find((r) => r.f.id === id)!.liste.length;
  const visibles = format === "tous" ? rayons : rayons.filter((r) => r.f.id === format);
  const total = visibles.reduce((t, r) => t + r.liste.length, 0);

  return (
    <>
      <input className="recherche" type="search" placeholder="Chercher un livre, un mot…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Chercher un livre" />

      <div className="portes-public" role="tablist" aria-label="Pour qui ?">
        {PUBLICS.map((p) => (
          <button key={p.id} role="tab" aria-selected={pourQui === p.id} className={`porte-public ${pourQui === p.id ? "actif" : ""}`} style={{ ["--c" as any]: p.couleur, ["--cc" as any]: p.clair }} onClick={() => setPourQui(pourQui === p.id ? "" : p.id)}>
            <span className="ico" aria-hidden>{p.emoji}</span>
            <b>{p.nom}</b>
            <small>{p.age}</small>
          </button>
        ))}
      </div>

      <div className="onglets-format" role="tablist" aria-label="Format">
        <button role="tab" aria-selected={format === "tous"} className={`onglet-format ${format === "tous" ? "actif" : ""}`} style={{ ["--c" as any]: "#1a1a1a" }} onClick={() => setFormat("tous")}>
          <span className="ico">📚</span><b>Tout</b>
        </button>
        {FORMATS.map((f) => (
          <button key={f.id} role="tab" aria-selected={format === f.id} className={`onglet-format ${format === f.id ? "actif" : ""}`} style={{ ["--c" as any]: f.couleur, ["--cc" as any]: f.clair }} onClick={() => setFormat(f.id)}>
            <span className="ico">{f.emoji}</span><b>{f.court}</b><small>{compte(f.id)}</small>
          </button>
        ))}
      </div>

      <div className="pastilles">
        {mode === "catalogue" ? (
          <>
            <button className={`pastille ${!univers ? "active" : ""}`} onClick={() => setUnivers("")}>Tous les univers</button>
            {UNIVERS.map((u) => (
              <button key={u.id} className={`pastille ${univers === u.id ? "active" : ""}`} style={univers === u.id ? { background: u.couleur, borderColor: u.couleur } : { borderColor: u.clair }} onClick={() => setUnivers(univers === u.id ? "" : u.id)}>
                {u.emoji} {u.nom}
              </button>
            ))}
          </>
        ) : (
          <>
            {ETATS.map((e) => (
              <button key={e.id} className={`pastille ${etat === e.id ? "active" : ""}`} onClick={() => setEtat(e.id)}>{e.nom}</button>
            ))}
            <select className="tri" value={tri} onChange={(e) => setTri(e.target.value as any)} aria-label="Trier">
              {TRIS.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </select>
          </>
        )}
      </div>

      {total === 0 && (
        <div className="vide"><div className="oiseau">🌿</div><p>Aucun livre ici pour le moment.</p>
          {(q || univers || pourQui || etat !== "tous") && <button className="btn secondaire" onClick={() => { setQ(""); setUnivers(""); setPourQui(""); setEtat("tous"); }}>Tout afficher</button>}
        </div>
      )}

      {format === "tous" && collections.length > 0 && (
        <section className="section">
          <h2>Les collections</h2>
          <div className="collections">
            {collections.map((c) => (
              <div key={c.nom} className="collection">
                <div className="entete-collection"><b>{c.nom}</b><span>{c.liste.length} tomes</span></div>
                <div className="rangee">
                  {c.liste.map((i) => <CarteLivre key={i.livre.id} livre={i.livre} acces={i.acces} pourcentage={i.pourcentage} favori={i.favori} montrerFormat={false} />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {visibles.map(({ f, liste }) =>
        liste.length ? (
          <section key={f.id} className="section rayon" style={{ ["--c" as any]: f.couleur, ["--cc" as any]: f.clair }}>
            <div className="entete-rayon">
              <span className="pastille-rayon">{f.emoji}</span>
              <div>
                <h2>{f.nom} <span className="nb">{liste.length}</span></h2>
                <p>{f.texte}</p>
              </div>
            </div>
            <div className="grille">
              {liste.map((i) => (
                <CarteLivre key={i.livre.id} livre={i.livre} acces={i.acces} pourcentage={i.pourcentage} favori={i.favori} montrerFormat={false} />
              ))}
            </div>
          </section>
        ) : null
      )}
      {mode === "mes" && <p className="texte-doux" style={{ textAlign: "center", fontSize: 14, marginTop: 30 }}>Envie d'autres livres ? <Link className="lien" href="/catalogue">Parcourir le catalogue</Link></p>}
    </>
  );
}
