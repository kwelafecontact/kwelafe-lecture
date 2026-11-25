// Version allégée d'un livre pour l'envoyer aux écrans de liste (sans la liste complète des pages)
import type { Livre } from "./donnees";
export const leger = (l: Livre): Livre => ({ ...l, manifeste: { type: l.manifeste.type } as any });
