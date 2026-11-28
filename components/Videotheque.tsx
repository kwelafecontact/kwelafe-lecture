"use client";
import { useEffect, useMemo, useState } from "react";
import { THEMES_VIDEO, miniature, type Video } from "@/lib/videos";
import Icone from "./Icones";

export default function Videotheque({ videos, enfants }: { videos: Video[]; enfants?: boolean }) {
  const [theme, setTheme] = useState<string>("tous");
  const [lecture, setLecture] = useState<Video | null>(null);
  const [vues, setVues] = useState<string[]>([]);
  useEffect(() => { try { setVues(JSON.parse(localStorage.getItem("kw-videos-vues") || "[]")); } catch {} }, []);
  useEffect(() => {
    if (!lecture) return;
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") setLecture(null); };
    window.addEventListener("keydown", f); document.body.style.overflow = "hidden";
    try { const n = Array.from(new Set([lecture.youtube_id, ...vues])).slice(0, 200); localStorage.setItem("kw-videos-vues", JSON.stringify(n)); setVues(n); } catch {}
    return () => { window.removeEventListener("keydown", f); document.body.style.overflow = ""; };
  }, [lecture]); // eslint-disable-line react-hooks/exhaustive-deps

  const themes = useMemo(() => THEMES_VIDEO.filter((t) => videos.some((v) => v.theme === t.id)), [videos]);
  const liste = theme === "tous" ? videos : videos.filter((v) => v.theme === theme);
  const parTheme = theme === "tous" ? themes.map((t) => ({ t, vs: videos.filter((v) => v.theme === t.id) })) : [{ t: themes.find((t) => t.id === theme)!, vs: liste }];

  return (
    <>
      <div className="vt-themes" role="tablist">
        <button role="tab" aria-selected={theme === "tous"} className={theme === "tous" ? "sel" : ""} onClick={() => setTheme("tous")}>Tout</button>
        {themes.map((t) => <button key={t.id} role="tab" aria-selected={theme === t.id} className={theme === t.id ? "sel" : ""} style={{ ["--c" as any]: t.couleur }} onClick={() => setTheme(t.id)}>{t.emoji} {t.nom}</button>)}
      </div>

      {parTheme.map(({ t, vs }) => (
        <section key={t.id} className="section vt-section" style={{ ["--c" as any]: t.couleur }}>
          <div className="bloc-editorial petit"><div className="eyebrow">{t.emoji} {t.nom}</div><h2>{vs.length} vidéo{vs.length > 1 ? "s" : ""}</h2></div>
          <div className="vt-grille">
            {vs.map((v) => (
              <button key={v.youtube_id} className={`vt-carte ${vues.includes(v.youtube_id) ? "vue" : ""}`} onClick={() => setLecture(v)} aria-label={`Regarder : ${v.titre}`}>
                <span className="vt-mini">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={miniature(v.youtube_id)} alt="" loading="lazy" />
                  <span className="vt-play"><Icone nom="play" taille={22} /></span>
                  {v.duree && <span className="vt-duree">{v.duree}</span>}
                  {vues.includes(v.youtube_id) && <span className="vt-vue">Vu ✓</span>}
                </span>
                <b>{v.titre}</b>
                <small>{v.chaine}</small>
              </button>
            ))}
          </div>
        </section>
      ))}

      {lecture && (
        <div className="vt-fond" onClick={() => setLecture(null)} role="dialog" aria-modal="true" aria-label={lecture.titre}>
          <div className="vt-lecteur" onClick={(e) => e.stopPropagation()}>
            <div className="vt-cadre">
              <iframe src={`https://www.youtube-nocookie.com/embed/${lecture.youtube_id}?autoplay=1&rel=0&modestbranding=1&hl=fr${enfants ? "&iv_load_policy=3" : ""}`} title={lecture.titre} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            </div>
            <div className="vt-infos">
              <div><b>{lecture.titre}</b><small>{lecture.chaine}{lecture.duree ? ` · ${lecture.duree}` : ""}</small></div>
              <button className="btn secondaire" onClick={() => setLecture(null)}><Icone nom="fermer" taille={18} /> Fermer</button>
            </div>
            <p className="vt-note">Vidéo diffusée depuis YouTube. Si elle ne démarre pas, <a href={`https://www.youtube.com/watch?v=${lecture.youtube_id}`} target="_blank" rel="noopener">ouvrez-la sur YouTube</a>.</p>
          </div>
        </div>
      )}
    </>
  );
}
