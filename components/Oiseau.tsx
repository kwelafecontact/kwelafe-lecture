// Paille-en-queue stylisé (à remplacer par l'illustration officielle si souhaité : /public/mascotte.png).
export default function Oiseau({ taille = 80 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 120 120" aria-label="Paille-en-queue Kwélafé" role="img">
      <path d="M18 70 C34 46 58 40 78 48 C70 54 64 60 62 68 C52 66 36 68 18 70 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M78 48 C88 40 100 42 104 50 C98 50 92 54 90 58 C84 56 80 52 78 48 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M104 50 L114 52 L104 55 Z" fill="#e8a400" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="97" cy="49" r="2.4" fill="#1a1a1a" />
      <path d="M62 68 C54 80 40 92 14 104" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 70 C56 84 46 98 30 112" fill="none" stroke="#c8361d" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 58 C46 52 56 50 64 52" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
