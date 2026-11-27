import NavBas from "@/components/NavBas";
import FabriqueZistoir from "@/components/FabriqueZistoir";
export const metadata = { title: "Fabrique à zistoir · Kwélafé" };
export default function Page() {
  return (<><main className="page page-creole-enfant">
    <header className="ce-entete" style={{ background: "linear-gradient(135deg,#7a2e8f,#1f6fb2)" }}>
      <div style={{ fontSize: 60 }}>📖</div>
      <div><div className="eyebrow">Coin des enfants</div><h1>Fabrique à zistoir</h1><p>Choisis ton héros, ton lieu, ton compagnon et ton objet : ton histoire péi est prête !</p></div>
    </header>
    <FabriqueZistoir />
  </main><NavBas /></>);
}
