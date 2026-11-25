// Types du gestionnaire de performances commun (source : performances.js, même dossier).
export const appareil: { ios: boolean; iphone: boolean; ipad: boolean; pwa: boolean; tactile: boolean; coeurs: number; memoire: number; dpr: number };
export function dprMax(): number;
export function dprCible(plafondJeu?: number): number;
export function tailleTextureMax(): number;
export function journal(type: string, detail?: string): { t: string; type: string; detail: string; page: string };
export function lireJournal(): { t: string; type: string; detail: string; page: string }[];
export function diagnosticDemarrage(nom: string): "navigation" | "rechargement" | "retour" | "reprise-apres-arret";
export const sauvegarde: {
  lire<T = unknown>(cle: string, defaut?: T | null): Promise<T | null>;
  ecrire(cle: string, valeur: unknown): Promise<void>;
  effacer(cle: string): Promise<void>;
};
export type OptionsPerf = {
  nom?: string;
  niveauInitial?: number;
  mode30?: boolean;
  qualiteAuto?: boolean;
  intervalleSauvegarde?: number;
  surPause?: (raison: string) => void;
  surReprise?: (raison: string) => void;
  surSauvegarde?: (raison: string) => void;
  surQualite?: (niveau: number, mode30: boolean) => void;
};
export class GestionnairePerf {
  constructor(opts?: OptionsPerf);
  nom: string;
  niveau: number;
  mode30: boolean;
  actif: boolean;
  detruit: boolean;
  typeDemarrage: string;
  ecouter(cible: EventTarget, type: string, f: (e: any) => void, options?: AddEventListenerOptions | boolean): () => void;
  minuterie(f: () => void, ms: number): ReturnType<typeof setTimeout>;
  intervalle(f: () => void, ms: number): ReturnType<typeof setInterval>;
  boucle(f: (now: number) => void): void;
  arreterBoucle(): void;
  doitDessiner(now?: number): boolean;
  baisser(ips?: number): void;
  sauverMaintenant(raison?: string): void;
  surveillerContexte(canvas: HTMLCanvasElement, o?: { perdu?: () => void; restaure?: () => void; secours?: () => void; delai?: number }): void;
  detruire(): void;
}
export function libererCanvas(c: HTMLCanvasElement | null | undefined): void;
export function reveillerAudio(ctx: AudioContext | null | undefined): void;
export function endormirAudio(ctx: AudioContext | null | undefined): void;
export function afficherSecours(o?: { titre?: string; texte?: string; bouton?: string; action?: () => void }): void;
