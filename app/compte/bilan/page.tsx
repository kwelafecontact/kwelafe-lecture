import Link from "next/link";
import NavBas from "@/components/NavBas";
import PartagerBilan from "@/components/PartagerBilan";
import { Couverture } from "@/components/CarteLivre";
import { contexte } from "@/lib/contexte";
import { statistiques } from "@/lib/stats";
import { UNIVERS } from "@/lib/config";
import { tous } from "@/lib/cf";

export const metadata = { title: "Mon année avec Kwélafé" };

export default async function Bilan() {
  const { session, livres, progs } = await contexte();
  const stats = await statistiques(session.cid);
  const finis = progs.filter((p) => p.termine).map((p) => livres.find((l) => l.id === p.livre_id)).filter((l): l is NonNullable<typeof l> => !!l);
  const commences = progs.filter((p) => !p.termine && p.pourcentage > 0).length;
  const appr = (await tous<{ xp: number; finies: string }>("SELECT xp, finies FROM apprendre_progres WHERE client_id = ? OR client_id LIKE ?", session.cid, session.cid + "#%").catch(() => []));
  const xp = appr.reduce((t, a) => t + (a.xp || 0), 0);
  const lecons = appr.reduce((t, a) => { try { return t + Object.keys(JSON.parse(a.finies || "{}")).length; } catch { return t; } }, 0);
  const heures = Math.floor(stats.minutesTotal / 60), minutes = stats.minutesTotal % 60;
  const tampons = UNIVERS.map((u) => ({ ...u, n: finis.filter((l) => l.univers === u.id).length }));
  const resume = `Mon année avec Kwélafé : ${finis.length} livre${finis.length > 1 ? "s" : ""} terminé${finis.length > 1 ? "s" : ""}, ${heures} h ${minutes} min de lecture, ${lecons} leçon${lecons > 1 ? "s" : ""} de créole. 🌺`;

  return (
    <>
      <main className="page page-bilan">
        <header className="bilan-hero">
          <div className="eyebrow">Mon bilan</div>
          <h1>Votre voyage avec Kwélafé</h1>
          <p>Tout ce que vous avez lu, appris et découvert sur La Réunion.</p>
        </header>
        <div className="bilan-chiffres">
          <div><b>{finis.length}</b><span>📚 livres terminés</span></div>
          <div><b>{commences}</b><span>📖 en cours</span></div>
          <div><b>{heures}<small>h</small>{minutes}</b><span>⏱ de lecture</span></div>
          <div><b>{stats.serie}</b><span>🔥 jours de suite</span></div>
          <div><b>{lecons}</b><span>🐦 leçons de créole</span></div>
          <div><b>{xp}</b><span>⭐ points gagnés</span></div>
        </div>

        <section className="section">
          <div className="bloc-editorial petit"><div className="eyebrow">Mon passeport péi</div><h2>Un tampon par univers exploré</h2></div>
          <div className="passeport">
            {tampons.map((t) => (
              <div key={t.id} className={`tampon ${t.n ? "ok" : ""}`} style={{ ["--c" as any]: t.couleur }}>
                <span>{t.emoji}</span><b>{t.nom}</b><small>{t.n ? `${t.n} livre${t.n > 1 ? "s" : ""}` : "À découvrir"}</small>
              </div>
            ))}
          </div>
        </section>

        {finis.length > 0 && (
          <section className="section">
            <div className="bloc-editorial petit"><h2>Mes livres terminés</h2></div>
            <div className="arrives-liste">{finis.map((l) => <Link key={l.id} href={`/livre/${l.slug}`}><Couverture livre={l} /></Link>)}</div>
          </section>
        )}

        <PartagerBilan texte={resume} />
        <p style={{ textAlign: "center" }}><Link className="btn secondaire" href="/catalogue">Continuer l'aventure</Link></p>
      </main>
      <NavBas />
    </>
  );
}
