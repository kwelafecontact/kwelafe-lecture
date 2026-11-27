import NavBas from "@/components/NavBas";
import Apprendre from "@/components/Apprendre";
import { unites } from "@/lib/apprendre";

export const metadata = { title: "Apprendre le créole · Kwélafé" };

export default function PageApprendre() {
  return (
    <>
      <main className="page page-apprendre">
        <Apprendre unites={unites()} />
      </main>
      <NavBas />
    </>
  );
}
