import Link from "next/link";
export default function Introuvable() {
  return (
    <main className="vide" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div className="oiseau">🌿</div>
      <h2>Cette page s'est envolée</h2>
      <p className="texte-doux">Le paille-en-queue n'a rien trouvé ici.</p>
      <Link className="btn" href="/">Retour à l'accueil</Link>
    </main>
  );
}
