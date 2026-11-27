"use client";
import { useEffect, useState } from "react";

// Lecture à voix haute gratuite : voix française intégrée à l'appareil.
const PREFEREES = ["Amélie", "Audrey", "Aurélie", "Marie", "Google français", "Denise", "Julie", "Hortense", "Thomas"];

function choisirVoix(): SpeechSynthesisVoice | null {
  const v = window.speechSynthesis.getVoices().filter((x) => x.lang.toLowerCase().startsWith("fr"));
  if (!v.length) return null;
  for (const nom of PREFEREES) {
    const t = v.find((x) => x.name.includes(nom));
    if (t) return t;
  }
  return v.find((x) => /premium|enhanced|natural/i.test(x.name)) || v.find((x) => x.lang === "fr-FR") || v[0];
}

export default function BoutonEcouter({ texte }: { texte: string }) {
  const [ok, setOk] = useState(false);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setOk(true);
    window.speechSynthesis.getVoices();
    return () => window.speechSynthesis.cancel();
  }, []);

  // On arrête la lecture quand la page change
  useEffect(() => {
    if (ok) { window.speechSynthesis.cancel(); setLit(false); }
  }, [texte, ok]);

  if (!ok) return null;

  function basculer() {
    const s = window.speechSynthesis;
    if (lit) { s.cancel(); setLit(false); return; }
    const u = new SpeechSynthesisUtterance(texte.replace(/…/g, "... "));
    const voix = choisirVoix();
    if (voix) u.voice = voix;
    u.lang = voix?.lang || "fr-FR";
    u.rate = 0.88;
    u.pitch = 1.05;
    u.onend = () => setLit(false);
    u.onerror = () => setLit(false);
    s.cancel();
    s.speak(u);
    setLit(true);
  }

  return (
    <button type="button" className="bouton-ecouter" onClick={basculer} aria-pressed={lit}>
      {lit ? "⏸ Arrêter" : "▶ Écouter"}
    </button>
  );
}
