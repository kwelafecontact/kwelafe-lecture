// Sons de Koup Koup, entièrement fabriqués par le navigateur (Web Audio). Aucune voix.
import type { Son } from "./fruits";

export class Sons {
  private ctx: AudioContext | null = null;
  private maitre: GainNode | null = null;
  private bruitBlanc: AudioBuffer | null = null;
  private salle: GainNode | null = null;       // envoi vers une petite réverbération (cuisine)
  private derniereGoutte = 0;
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
      // Petite pièce : une réverbération courte rend les sons moins « synthétiques »
      const conv = this.ctx.createConvolver();
      const lg = Math.round(this.ctx.sampleRate * 0.45);
      const ir = this.ctx.createBuffer(2, lg, this.ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = ir.getChannelData(c);
        for (let i = 0; i < lg; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / lg, 3.2);
      }
      conv.buffer = ir;
      this.salle = this.ctx.createGain();
      this.salle.gain.value = 0.08;
      this.salle.connect(conv).connect(comp);
      const n = this.ctx.sampleRate * 1.5;
      this.bruitBlanc = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = this.bruitBlanc.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state !== "running" && this.ctx.state !== "closed") this.ctx.resume().catch(() => {}); // iOS : « suspended » ou « interrupted »
  }

  private pret() {
    return this.actif && this.ctx && this.maitre && this.bruitBlanc ? this.ctx : null;
  }

  private bruit(debut: number, duree: number, filtre: BiquadFilterType, f0: number, f1: number, volume: number, q = 1, attaque = 0.02) {
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
    g.gain.exponentialRampToValueAtTime(volume, debut + Math.min(attaque, duree * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
    src.connect(fl).connect(g);
    g.connect(this.maitre!);
    if (this.salle) g.connect(this.salle);
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
    o.connect(g);
    g.connect(this.maitre!);
    if (this.salle) g.connect(this.salle);
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

  /**
   * Impact d'une goutte : un « tic » mouillé, très court et sec, joué de près (sans réverbération).
   * f : fréquence centrale (plus aiguë pour une petite goutte), volume : force de l'impact.
   */
  private plic(t: number, f: number, volume: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.bruitBlanc;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = f;
    bp.Q.value = 1.1;
    const g = ctx.createGain();
    const duree = 0.006 + Math.random() * 0.008;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume, t + 0.0007);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    src.connect(bp).connect(g).connect(this.maitre!);
    src.start(t, Math.random());
    src.stop(t + duree + 0.02);
    // petit corps grave de l'impact sur le bois
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(260 + Math.random() * 120, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.014);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(volume * 0.45, t + 0.001);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
    o.connect(g2).connect(this.maitre!);
    o.start(t);
    o.stop(t + 0.03);
  }

  /** Bruit mouillé : filtre résonant qui glisse vers le grave, avec un léger « gargouillis ». */
  private squelch(t: number, duree: number, f0: number, f1: number, volume: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.bruitBlanc;
    const fl = ctx.createBiquadFilter();
    fl.type = "bandpass";
    fl.Q.value = 5;
    fl.frequency.setValueAtTime(f0, t);
    fl.frequency.exponentialRampToValueAtTime(f1, t + duree);
    // modulation rapide de la fréquence = texture mouillée
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 28 + Math.random() * 20;
    const prof = ctx.createGain();
    prof.gain.value = f0 * 0.25;
    lfo.connect(prof).connect(fl.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume, t + 0.012);
    g.gain.setTargetAtTime(volume * 0.5, t + 0.03, duree * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    src.connect(fl).connect(g);
    g.connect(this.maitre!);
    if (this.salle) g.connect(this.salle);
    src.start(t, Math.random());
    src.stop(t + duree + 0.05);
    lfo.start(t);
    lfo.stop(t + duree + 0.05);
  }

  /**
   * Découpe d'un fruit : chaque fruit a son propre mélange de couches sonores.
   * son : profil du fruit, jus : 0 (sec) à 1 (très juteux), viscosite : 0 liquide à 1 épais.
   */
  decoupe(son: Son, jus: number, viscosite: number) {
    const ctx = this.pret();
    if (!ctx) return;
    const t = ctx.currentTime + 0.005;
    const v = () => 1 + (Math.random() - 0.5) * 0.18;               // petites variations : jamais deux coupes identiques
    const aigu = son.aigu ?? 0.5;
    const croquant = son.croquant ?? 0, coque = son.coque ?? 0, mou = son.mou ?? 0, sec = son.sec ?? 0;

    // 1. La lame qui tranche la peau
    this.bruit(t, 0.05 + (1 - aigu) * 0.03, "highpass", (2600 + aigu * 2400) * v(), 1500, 0.16 + croquant * 0.08, 0.7, 0.003);

    // 2. Craquement de la chair ferme : une rafale de petits grains
    if (croquant > 0.05) {
      const n = Math.round(4 + croquant * 14);
      const etalement = 0.04 + croquant * 0.07;
      for (let i = 0; i < n; i++) {
        const ti = t + Math.random() * etalement;
        this.bruit(ti, 0.006 + Math.random() * 0.01, "bandpass", (1600 + aigu * 2200 + Math.random() * 1800) * v(), 1200, 0.1 + croquant * 0.22, 2.5, 0.001);
      }
    }

    // 3. Coque dure : un « toc » boisé (partiels inharmoniques) et une fêlure
    if (coque > 0.05) {
      const base = (260 + aigu * 380) * v();
      [1, 2.76, 5.4].forEach((m, i) => this.ton(t, 0.09 - i * 0.02, "sine", base * m, base * m * 0.97, (0.35 - i * 0.1) * coque));
      this.bruit(t + 0.004, 0.07, "bandpass", 1800 * v(), 900, 0.25 * coque, 1.8, 0.002);
    }

    // 4. Claquement sec (gousse, piment)
    if (sec > 0.05) {
      this.bruit(t, 0.012, "highpass", 5200 * v(), 4000, 0.3 * sec, 0.8, 0.001);
      for (let i = 0; i < 4; i++) this.bruit(t + 0.01 + Math.random() * 0.03, 0.005, "bandpass", 3800 * v(), 3000, 0.12 * sec, 3, 0.001);
    }

    // 5. Chair tendre : choc sourd et mouillé
    if (mou > 0.05) {
      this.ton(t, 0.12 + mou * 0.06, "sine", (160 - (1 - aigu) * 60) * v(), 55, 0.28 * mou + 0.08);
      this.bruit(t, 0.12 + mou * 0.1, "lowpass", 900 * v(), 200, 0.2 * mou, 1, 0.006);
    } else {
      this.ton(t, 0.09, "sine", (190 - (1 - aigu) * 90) * v(), 60, 0.16);
    }

    // 6. Le jus : un « schlic » mouillé, plus long et plus grave si le jus est épais
    if (jus > 0.08) {
      const duree = 0.12 + jus * 0.22 + viscosite * 0.12;
      const f0 = (2200 - viscosite * 1100 + aigu * 600) * v();
      this.squelch(t + 0.01, duree, f0, f0 * (0.28 + viscosite * 0.12), 0.12 + jus * 0.3);
      // éclaboussure : souffle liquide clair pour les jus liquides
      if (viscosite < 0.5) this.bruit(t + 0.02, 0.18 + jus * 0.15, "bandpass", 3200 * v(), 1400, 0.06 + jus * 0.1, 1.2, 0.01);
      // 7. Gouttes qui éclatent juste après la coupe
      // 7. Gouttes qui retombent juste après la coupe : impacts courts et francs
      const nb = Math.round(jus * (viscosite > 0.7 ? 5 : 12));
      for (let i = 0; i < nb; i++) {
        this.plic(t + 0.07 + Math.random() * (0.2 + jus * 0.25), (1300 + Math.random() * 1500) * (1 - viscosite * 0.4), 0.06 + Math.random() * 0.09);
      }
    }
  }

  /** Une goutte de jus qui tombe sur la planche (très discret). */
  goutteTombe(taille: number) {
    const ctx = this.pret();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (t - this.derniereGoutte < 0.03) return;
    this.derniereGoutte = t;
    this.plic(t, 2600 - taille * 9000 + Math.random() * 600, 0.03 + taille * 0.35);
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

  /** Arrière-plan : le son s'endort (il se réveille au prochain toucher). */
  endormir() {
    if (this.ctx && this.ctx.state === "running") this.ctx.suspend().catch(() => {});
  }

  detruire() {
    this.ctx?.close();
    this.ctx = null;
  }
}
