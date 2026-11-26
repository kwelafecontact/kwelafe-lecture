import Link from "next/link";

// Mise en page commune des pages légales (lisibles sans être connecté).
export default function PageLegale({ titre, maj, children }: { titre: string; maj: string; children: React.ReactNode }) {
  return (
    <main className="page page-legale">
      <Link href="/" className="lien">← Retour à l'application</Link>
      <h1>{titre}</h1>
      <p className="texte-doux">Dernière mise à jour : {maj}</p>
      <div className="texte-legal">{children}</div>
      <nav className="liens-legaux">
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/confidentialite">Confidentialité</Link>
        <Link href="/cgu">Conditions d'utilisation</Link>
      </nav>
    </main>
  );
}
