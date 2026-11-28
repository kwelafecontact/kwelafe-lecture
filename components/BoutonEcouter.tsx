"use client";
import { useEffect, useRef, useState } from "react";

// Lecture à voix haute gratuite : voix française intégrée à l'appareil.
const PREFEREES = ["Amélie", "Audrey", "Aurélie", "Marie", "Google français", "Denise", "Julie", "Hortense", "Thomas"];

function choisirVoix(liste: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const v = liste.filter((x) => x.lang.toLowerCase().startsWith("fr"));
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
  // Safari renvoie souvent une liste vide au premier appel : les voix arrivent ensuite,
  // annoncées par l'événement « voiceschanged ». On garde la dernière liste connue.
  const voix = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const s = window.speechSynthesis;
    setOk(true);
    const relire = () => { voix.current = s.getVoices(); };
    relire();
    s.addEventListener?.("voiceschanged", relire);
    return () => { s.removeEventListener?.("voiceschanged", relire); s.cancel(); };
  }, []);

  // On arrête la lecture quand la page change
  useEffect(() => {
    if (ok) { window.speechSynthesis.cancel(); setLit(false); }
  }, [texte, ok]);

  if (!ok) return null;

  function basculer() {
    const s = window.speechSynthesis;
    if (lit) { s.cancel(); setLit(false); return; }
    if (!voix.current.length) voix.current = s.getVoices();
    const u = new SpeechSynthesisUtterance(texte.replace(/…/g, "... "));
    const choisie = choisirVoix(voix.current);
    if (choisie) u.voice = choisie;
    u.lang = choisie?.lang || "fr-FR";
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
