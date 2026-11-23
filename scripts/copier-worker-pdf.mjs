// Copie le moteur PDF.js dans /public pour l'import des PDF dans l'espace admin.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
const source = "node_modules/pdfjs-dist/build/pdf.worker.min.mjs";
if (existsSync(source)) {
  mkdirSync("public", { recursive: true });
  copyFileSync(source, "public/pdf.worker.min.mjs");
}
