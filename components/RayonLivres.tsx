// Grille de livres simple (pages univers / âge / catalogue par thème).
import CarteLivre from "./CarteLivre";
import type { Livre } from "@/lib/donnees";

export default function RayonLivres({ livres, acces, prog, favoris }: { livres: Livre[]; acces: Map<string, boolean>; prog: Map<string, { pourcentage: number }>; favoris: Set<string> }) {
  if (!livres.length) return <div className="vide"><div className="oiseau">🌿</div><p>Pas encore de livre ici. Reviens très vite !</p></div>;
  return (
    <div className="grille">
      {livres.map((l) => <CarteLivre key={l.id} livre={l} acces={!!acces.get(l.id)} pourcentage={prog.get(l.id)?.pourcentage || 0} favori={favoris.has(l.id)} />)}
    </div>
  );
}
