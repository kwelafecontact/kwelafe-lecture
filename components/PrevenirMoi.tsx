"use client";
import { useState } from "react";
export default function PrevenirMoi({ livre, deja }: { livre: string; deja: boolean }) {
  const [on, setOn] = useState(deja);
  const [msg, setMsg] = useState("");
  async function basculer() {
    const r = await fetch("/api/alertes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ livre, action: on ? "retirer" : "ajouter" }) });
    if (r.status === 401) { setMsg("Connecte-toi pour être prévenu"); return; }
    setOn(!on);
  }
  return <><button type="button" className={`prevenir ${on ? "on" : ""}`} onClick={basculer}>{on ? "🔔 Je serai prévenu" : "🔕 Préviens-moi"}</button>{msg && <small className="texte-doux">{msg}</small>}</>;
}
