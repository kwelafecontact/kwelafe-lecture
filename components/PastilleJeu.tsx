import Link from "next/link";
import { config } from "@/lib/config";

// Lien vers un jeu, ou cadenas qui mène à l'abonnement si le jeu n'est pas inclus.
export default function PastilleJeu({ id, titre, emoji, ouvert }: { id: string; titre: string; emoji?: string; ouvert: boolean }) {
  return ouvert ? (
    <Link href={`/jeux/${id}`} className="pastille">{emoji ?? "🎮"} {titre}</Link>
  ) : (
    <a href={config.abonnementUrl} className="pastille pastille-verrou" title="Inclus dans l'abonnement">🔒 {titre}</a>
  );
}
