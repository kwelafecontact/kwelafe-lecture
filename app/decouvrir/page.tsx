import NavBas from "@/components/NavBas";
import Videotheque from "@/components/Videotheque";
import { listeVideos } from "@/lib/videos";

export const metadata = { title: "Découvrir La Réunion · Kwélafé" };

export default async function Decouvrir({ searchParams }: { searchParams: Promise<{ enfants?: string }> }) {
  const sp = await searchParams;
  const enfants = sp.enfants === "1";
  const videos = await listeVideos(enfants);
  return (
    <>
      <main className="page">
        <header className="hero-decouvrir">
          <div>
            <div className="eyebrow">{enfants ? "Coin des enfants" : "Vidéos et documentaires"}</div>
            <h1>Découvrir La Réunion</h1>
            <p>Le volcan, les cirques, l'océan et ses coraux, la vanille, les objets lontan, les animaux de l'île… {videos.length} vidéos éducatives choisies pour comprendre et aimer La Réunion.</p>
          </div>
        </header>
        <Videotheque videos={videos} enfants={enfants} />
      </main>
      <NavBas />
    </>
  );
}
