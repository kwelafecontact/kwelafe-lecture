import Link from "next/link";
import { urlCouverture } from "@/lib/cf";
import type { Livre } from "@/lib/donnees";
import { formatDe, infoFormat } from "@/lib/formats";
import { collectionDe } from "@/lib/organisation";

export function Couverture({ livre, verrouille }: { livre: Pick<Livre, "titre" | "couverture"> & { publie_le?: string | null }; verrouille?: boolean }) {
  const nouveau = !!livre.publie_le && Date.now() - Date.parse(livre.publie_le) < 14 * 864e5;
  const src = urlCouverture(livre.couverture);
  const t = collectionDe(livre.titre)?.tome || 0;
  return (
    <div className={`couv${t ? ` couv-tome tome-${((t - 1) % 4) + 1}` : ""}`}>
      {t > 0 && <span className="badge-tome">{/volume|vol\b/i.test(livre.titre) ? "Vol." : "Tome"} {t}</span>}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`Couverture : ${livre.titre}`} loading="lazy" />
      ) : (
        <div className="sans-image">{livre.titre}</div>
      )}
      {nouveau && <span className="badge-nouveau">Nouveau</span>}
      {verrouille && (
        <div className="verrou" aria-label="Non inclus">
          <span>🔒</span>
        </div>
      )}
    </div>
  );
}

export function BadgeFormat({ livre }: { livre: Pick<Livre, "manifeste"> }) {
  const f = infoFormat(formatDe(livre));
  return <span className="badge format" style={{ background: f.clair, color: f.couleur }}>{f.emoji} {f.court}</span>;
}

export default function CarteLivre({
  livre,
  acces,
  pourcentage,
  favori,
  montrerFormat = true,
}: {
  livre: Livre;
  acces: boolean;
  pourcentage?: number;
  favori?: boolean;
  montrerFormat?: boolean;
  montrerInclus?: boolean;
}) {
  return (
    <Link href={`/livre/${livre.slug}`} className="carte-livre">
      <Couverture livre={livre} verrouille={!acces} />
      {favori && <span className="coeur-carte" aria-label="Favori">❤</span>}
      <div className="titre">{livre.titre}</div>
      {typeof pourcentage === "number" && pourcentage > 0 && (
        <div className="barre" aria-label={`Lu à ${Math.round(pourcentage)} %`}>
          <i style={{ width: `${Math.min(100, pourcentage)}%` }} />
        </div>
      )}
      <div className="badges">
        {montrerFormat && <BadgeFormat livre={livre} />}
        {livre.gratuit ? <span className="badge gratuit">Gratuit</span> : acces && livre.inclus_abonnement && <span className="badge inclus">Inclus</span>}
      </div>
    </Link>
  );
}
