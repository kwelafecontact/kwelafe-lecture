"use client";
// Carrousel horizontal avec deux flèches, sans barre de défilement visible.
import { useRef } from "react";

export default function Carrousel({ children, libelle }: { children: React.ReactNode; libelle: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const aller = (sens: number) => ref.current?.scrollBy({ left: sens * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div className="carrousel" role="region" aria-label={libelle}>
      <button className="car-fleche g" aria-label="Précédent" onClick={() => aller(-1)}>‹</button>
      <div className="car-piste" ref={ref}>{children}</div>
      <button className="car-fleche d" aria-label="Suivant" onClick={() => aller(1)}>›</button>
    </div>
  );
}
