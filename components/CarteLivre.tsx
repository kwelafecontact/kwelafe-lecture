import Link from "next/link";
import { urlCouverture } from "@/lib/cf";
import type { Livre } from "@/lib/donnees";

export function Couverture({ livre, verrouille }: { livre: Pick<Livre, "titre" | "couverture">; verrouille?: boolean }) {
  const src = urlCouverture(livre.couverture);
  return (
    <div className="couv">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`Couverture : ${livre.titre}`} loading="lazy" />
      ) : (
        <div className="sans-image">{livre.titre}</div>
      )}
      {verrouille && (
        <div className="verrou" aria-label="Non inclus">
          <span>🔒</span>
        </div>
      )}
    </div>
  );
}

export default function CarteLivre({
  livre,
  acces,
  pourcentage,
  montrerInclus,
}: {
  livre: Livre;
  acces: boolean;
  pourcentage?: number;
  montrerInclus?: boolean;
}) {
  return (
    <Link href={`/livre/${livre.slug}`} className="carte-livre">
      <Couverture livre={livre} verrouille={!acces} />
      <div className="titre">{livre.titre}</div>
      {typeof pourcentage === "number" && pourcentage > 0 && (
        <div className="barre" aria-label={`Lu à ${Math.round(pourcentage)} %`}>
          <i style={{ width: `${Math.min(100, pourcentage)}%` }} />
        </div>
      )}
      {montrerInclus && acces && <span className="badge inclus">Inclus</span>}
      {!montrerInclus && livre.type === "epub_interactif" && <span className="badge interactif">Interactif</span>}
    </Link>
  );
}
