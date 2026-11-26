"use client";
// Avatar péi choisi par la personne (gardé sur cet appareil). Toucher l'avatar permet d'en changer.
import { useEffect, useState } from "react";
import { AVATARS } from "@/lib/avatars";

export default function Avatar({ taille = 56, cle = "kw-avatar", modifiable = true }: { taille?: number; cle?: string; modifiable?: boolean }) {
  const [id, setId] = useState<string>("paille-en-queue");
  const [ouvert, setOuvert] = useState(false);
  useEffect(() => { try { const v = localStorage.getItem(cle); if (v) setId(v); } catch {} }, [cle]);
  const choisir = (v: string) => { setId(v); setOuvert(false); try { localStorage.setItem(cle, v); } catch {} };
  return (
    <>
      <button type="button" className="avatar-bouton" style={{ width: taille, height: taille }} onClick={(e) => { e.stopPropagation(); if (modifiable) setOuvert(true); }} aria-label="Changer mon avatar" title={modifiable ? "Changer mon avatar" : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/avatars/${id}.svg`} alt="" />
        {modifiable && <span className="avatar-crayon" aria-hidden>✎</span>}
      </button>
      {ouvert && (
        <div className="avatar-voile" onClick={() => setOuvert(false)}>
          <div className="avatar-panneau" onClick={(e) => e.stopPropagation()}>
            <h2>Choisis ton avatar</h2>
            <div className="avatar-grille">
              {AVATARS.map((a) => (
                <button key={a.id} type="button" className={id === a.id ? "actif" : ""} onClick={() => choisir(a.id)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/avatars/${a.id}.svg`} alt="" />
                  <small>{a.nom}</small>
                </button>
              ))}
            </div>
            <button type="button" className="btn secondaire" onClick={() => setOuvert(false)}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}
