"use client";
import { useState } from "react";
export default function BoutonFait({ devoir, initial }: { devoir: string; initial: boolean }) {
  const [fait, setFait] = useState(initial);
  async function basculer() {
    const v = !fait; setFait(v);
    await fetch("/api/devoirs/fait", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ devoir, fait: v }) }).catch(() => setFait(!v));
  }
  return <button className={`btn-fait ${fait ? "ok" : ""}`} onClick={basculer}>{fait ? "✅ C'est fait !" : "☐ J'ai fini"}</button>;
}
