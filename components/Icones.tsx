// Icônes au trait, cohérentes, pour remplacer les emoji dans la navigation (rendu premium et identique sur tous les appareils).
const P: Record<string, string> = {
  accueil: "M3 11.5 12 4l9 7.5M5.5 10v9.5h4.5v-5h4v5h4.5V10",
  biblio: "M4 5.5h5a2 2 0 0 1 2 2V19a1.5 1.5 0 0 0-1.5-1.5H4zM20 5.5h-5a2 2 0 0 0-2 2V19a1.5 1.5 0 0 1 1.5-1.5H20z",
  lectures: "M6 4.5h10.5A1.5 1.5 0 0 1 18 6v13.5H7.5A1.5 1.5 0 0 0 6 21zM6 4.5A1.5 1.5 0 0 0 4.5 6v13.5A1.5 1.5 0 0 1 6 18h12M9 9h5",
  jeux: "M7 8h10a4 4 0 0 1 4 4v2.5a3 3 0 0 1-5.3 1.9L14.5 15h-5l-1.2 1.4A3 3 0 0 1 3 14.5V12a4 4 0 0 1 4-4zM8 11v3M6.5 12.5h3M15.5 11.5h.01M17.5 13h.01",
  compte: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0",
  classe: "M4 7l8-3 8 3-8 3zM7 9v5c0 1.5 2.2 3 5 3s5-1.5 5-3V9M20 7v5",
  apprendre: "M4 19.5V6a2 2 0 0 1 2-2h8l5 5v10.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19.5zM14 4v5h5M8 13h8M8 16.5h5",
  cloche: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0",
  fermer: "M6 6l12 12M18 6 6 18",
  flecheD: "M5 12h14m-6-6 6 6-6 6",
  plus: "M12 5v14M5 12h14",
  play: "M8 5.5v13l11-6.5z",
  video: "M4 7.5A1.5 1.5 0 0 1 5.5 6h9A1.5 1.5 0 0 1 16 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 16.5zM16 10l4-2.5v9L16 14",
  partager: "M12 15V4m0 0-4 4m4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6",
};

export default function Icone({ nom, taille = 24, epais = 1.9, className }: { nom: keyof typeof P | string; taille?: number; epais?: number; className?: string }) {
  const d = P[nom] || P.accueil;
  return (
    <svg className={className} width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={epais} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
