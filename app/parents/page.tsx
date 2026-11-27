import NavBas from "@/components/NavBas";
import BarriereParentale from "@/components/BarriereParentale";
import EspaceParents from "@/components/EspaceParents";

export const metadata = { title: "Espace parents · Kwélafé" };

export default function PageParents() {
  return (
    <>
      <main className="page">
        <BarriereParentale>
          <header className="entete-editorial">
            <div className="eyebrow">Espace parents</div>
            <h1>Suivre et accompagner</h1>
            <p>Les progrès de chaque enfant, nos conseils, et les réglages de la famille.</p>
          </header>
          <EspaceParents />
        </BarriereParentale>
      </main>
      <NavBas />
    </>
  );
}
