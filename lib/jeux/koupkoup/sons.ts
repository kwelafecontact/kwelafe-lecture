// Sons de Koup Koup, entièrement fabriqués par le navigateur (Web Audio). Aucune voix.

export class Sons {
  private ctx: AudioContext | null = null;
  private maitre: GainNode | null = null;
  private bruitBlanc: AudioBuffer | null = null;
  private dernierSouffle = 0;
  actif = true;

  /** À appeler lors d'un toucher (exigence des navigateurs pour démarrer l'audio). */
  reveiller() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.maitre = this.ctx.createGain();
      this.maitre.gain.value = 0.8;
      const comp = this.ctx.createDynamicsCompressor();
      this.maitre.connect(comp).connect(this.ctx.destination);
      const n = this.ctx.sampleRate * 1.5;
      this.bruitBlanc = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = this.bruitBlanc.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  private pret() {
    return this.actif && this.ctx && this.maitre && this.bruitBlanc ? this.ctx : null;
  }

  private bruit(debut: number, duree: number, filtre: BiquadFilterType, f0: number, f1: number, volume: number, q = 1) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.bruitBlanc;
    const fl = ctx.createBiquadFilter();
    fl.type = filtre;
    fl.Q.value = q;
    fl.frequency.setValueAtTime(f0, debut);
    fl.frequency.exponentialRampToValueAtTime(Math.max(20, f1), debut + duree);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, debut);
    g.gain.exponentialRampToValueAtTime(volume, debut + Math.min(0.02, duree * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
    src.connect(fl).connect(g).connect(this.maitre!);
    src.start(debut, Math.random() * 0.5);
    src.stop(debut + duree + 0.05);
  }

  private ton(debut: number, duree: number, type: OscillatorType, f0: number, f1: number, volume: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, debut);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), debut + duree);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, debut);
    g.gain.exponentialRampToValueAtTime(volume, debut + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
    o.connect(g).connect(this.maitre!);
    o.start(debut);
    o.stop(debut + duree + 0.05);
  }

  /** Souffle de la lame, plus fort quand le geste est rapide. */
  souffle(vitesse: number) {
    const ctx = this.pret();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (t - this.dernierSouffle < 0.14) return;
    this.dernierSouffle = t;
    const v = Math.min(1, vitesse);
    this.bruit(t, 0.16, "bandpass", 700 + v * 600, 2600 + v * 2000, 0.05 + v * 0.1, 1.4);
  }

  /** Découpe juteuse : taille 0 (petit fruit) à 1 (gros fruit), jus 0 à 1. */
  decoupe(taille: number, jus: number) {
    const ctx = this.pret();
    if (!ctx) return;
    const t = ctx.currentTime;
    const p = 1 + (Math.random() - 0.5) * 0.2;
    this.bruit(t, 0.07, "highpass", 3000 * p, 1800, 0.22);                         // la lame qui entre
    this.bruit(t + 0.01, 0.16 + jus * 0.18, "lowpass", 2200 * p, 380, 0.18 + jus * 0.25, 2); // le jus
    this.ton(t, 0.13, "sine", (190 - taille * 90) * p, 55, 0.35);                    // le choc sourd
    if (jus > 0.6) this.bruit(t + 0.09, 0.3, "bandpass", 900, 400, 0.08, 3);       // gouttes
  }

  combo(n: number) {
    const ctx = this.pret();
    if (!ctx) return;
    const t = ctx.currentTime;
    const base = 520 * Math.pow(1.06, Math.min(n, 8));
    [1, 1.26, 1.5, 2].forEach((m, i) => this.ton(t + i * 0.06, 0.28, "triangle", base * m, base * m * 1.01, 0.12));
  }

  dore() {
    const ctx = this.pret();
    if (!ctx) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 9; i++) this.ton(t + i * 0.045, 0.4, "sine", 1200 + i * 180, 1400 + i * 180, 0.07);
  }

  explosion() {
    const ctx = this.pret();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.bruit(t, 1.1, "lowpass", 1800, 60, 0.9, 0.7);
    this.ton(t, 0.7, "sine", 90, 28, 0.8);
    this.bruit(t + 0.05, 0.6, "bandpass", 3000, 600, 0.2, 2);
  }

  rate() {
    const ctx = this.pret();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.ton(t, 0.25, "sine", 330, 190, 0.18);
  }

  lancer() {
    const ctx = this.pret();
    if (!ctx) return;
    this.bruit(ctx.currentTime, 0.22, "bandpass", 300, 900, 0.035, 2);
  }

  fin() {
    const ctx = this.pret();
    if (!ctx) return;
    const t = ctx.currentTime;
    [523, 440, 349, 262].forEach((f, i) => this.ton(t + i * 0.16, 0.45, "triangle", f, f * 0.98, 0.14));
  }

  detruire() {
    this.ctx?.close();
    this.ctx = null;
  }
}
