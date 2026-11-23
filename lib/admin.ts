import { lireSession } from "./session";

export async function sessionAdmin() {
  const s = await lireSession();
  return s?.admin ? s : null;
}
