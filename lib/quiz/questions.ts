// Outils du quiz. Les questions viennent toutes des livres Kwélafé : voir banque.ts (généré par outils/quiz/gen.py).
export function melanger<T>(t: T[]): T[] { const a = [...t]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
