# 15 fruits et légumes péi en plus pour Koup Koup 2 (couleurs vives : rouge, orange, violet, rose, jaune, vert).
# Mêmes conventions que specs.py. Sources de présence à La Réunion : calendrier des fruits de saison (Chambre d'agriculture / DAAF),
# relevés de prix des marchés forains (DAAF), reunion.fr (tangor), CIRAD (grenadille jaune, ramboutan).
import math
from mathutils import Vector
from specs import *

def trois_feuilles(z, l=0.4, w=0.12, n=5, a0=0.35):
    def f(bm):
        for i in range(n):
            ang = i / n * 2 * math.pi
            v = [bm.verts.new(q) for q in (
                (0, 0, z),
                (math.cos(ang) * l * 0.5 + math.sin(ang) * w, math.sin(ang) * l * 0.5 - math.cos(ang) * w, z + 0.05),
                (math.cos(ang) * l, math.sin(ang) * l, z + a0 * 0.2),
                (math.cos(ang) * l * 0.5 - math.sin(ang) * w, math.sin(ang) * l * 0.5 + math.cos(ang) * w, z + 0.05))]
            bm.faces.new(v)
    return f

def segments(k_bord, couleur_a, couleur_b, n=10, pith=0.08, hi=0.07):
    """Chair d'agrume : écorce, peau blanche, quartiers séparés par de fines cloisons."""
    def chair(k, x, z, rm):
        if k < k_bord: return (0.98, 0.70, 0.12)
        if k < pith + k_bord: return (0.98, 0.96, 0.88)
        a = math.atan2(z, x)
        if abs(math.sin(a * n / 2)) < 0.07 or k > 0.93: return (0.99, 0.96, 0.86)
        return mix(couleur_a, couleur_b, k)
    return chair

NOUVEAUX = [
    dict(id='fraise', u=64, v=48, forme=ecailles(ovale(0.62, 0.62, 1.0, poire=-0.5), 16, 14, -0.03),
         peau=lambda c: (1.0, 0.90, 0.45) if motif_ecaille(c, 16, 14) < 0.1 else mix((0.95, 0.04, 0.10), (0.80, 0.02, 0.08), lis(0.15, 0.5, motif_ecaille(c, 16, 14))),
         chair=lambda k, x, z, rm: (0.95, 0.10, 0.15) if k < 0.1 else mix((0.99, 0.55, 0.55), (1.0, 0.85, 0.82), k),
         rough=0.3, tige=dict(r=0.04, h=0.12, z=0.97, feuilles=trois_feuilles(0.99, 0.42, 0.10, 6)), tige_c=(0.15, 0.62, 0.12)),
    dict(id='orange', forme=bosses(ovale(1.0, 1.0, 0.96, rel=0.008), 45, 0.012),
         peau=peau_degrade((1.0, 0.50, 0.04), (1.0, 0.60, 0.08), None, taches=(0.95, 0.40, 0.03), tf=60, ts=0.5),
         chair=segments(0.05, (1.0, 0.45, 0.02), (1.0, 0.62, 0.08), 10),
         rough=0.45, graines=dict(c=(0.96, 0.92, 0.75), liste=pepins_ovale(5, 0, 0, 0.2, 0.15, 0.035)['liste']),
         tige=dict(r=0.035, h=0.05, z=0.96, feuilles=lambda bm: feuille(bm, 0.1, 0.98, 0.45, 0.16, 0.25)), tige_c=(0.18, 0.55, 0.12)),
    dict(id='peche', forme=ovale(0.92, 0.9, 0.96, rel=0.008),
         peau=peau_degrade((1.0, 0.80, 0.30), (1.0, 0.72, 0.28), (0.95, 0.15, 0.22), (0.1, 1.0), ton=0.05),
         chair=lambda k, x, z, rm: (1.0, 0.70, 0.22) if k < 0.06 else mix((1.0, 0.76, 0.22), (1.0, 0.50, 0.15), lis(0.5, 1.0, k)),
         rough=0.6, graines=dict(c=(0.60, 0.32, 0.18), rough=0.8, liste=noyau(0, 0, 0.36, 0.5, 0.07)['liste']),
         tige=dict(r=0.03, h=0.06, z=0.95), tige_c=(0.35, 0.25, 0.12)),
    dict(id='prune', forme=ovale(0.80, 0.78, 1.0, rel=0.008),
         peau=lambda c: mix((0.42, 0.06, 0.55), (0.30, 0.04, 0.45), lis(-0.8, 0.8, c.z)) if bruit(c.p, 8) < 0.15 else mix((0.42, 0.06, 0.55), (0.62, 0.55, 0.85), 0.5),
         chair=lambda k, x, z, rm: (0.40, 0.08, 0.50) if k < 0.05 else mix((1.0, 0.78, 0.18), (1.0, 0.88, 0.40), k),
         rough=0.3, graines=dict(c=(0.62, 0.40, 0.22), rough=0.8, liste=noyau(0, 0, 0.28, 0.42, 0.06)['liste']),
         tige=dict(r=0.03, h=0.07, z=0.97), tige_c=(0.35, 0.28, 0.12)),
    dict(id='pasteque', forme=ovale(0.80, 0.80, 1.0, rel=0.006),
         peau=lambda c: mix((0.05, 0.38, 0.12), (0.45, 0.78, 0.25), lis(0.25, 0.75, abs(math.sin(c.a * 7 + bruit(c.p, 3) * 1.8)))),
         chair=lambda k, x, z, rm: (0.08, 0.42, 0.14) if k < 0.05 else ((0.95, 0.98, 0.80) if k < 0.12 else mix((1.0, 0.12, 0.22), (0.98, 0.25, 0.30), k)),
         rough=0.3, graines=dict(c=(0.05, 0.04, 0.03), rough=0.2, liste=pepins_ovale(26, 0, 0, 0.55, 0.62, 0.035, 0.03)['liste']),
         tige=dict(r=0.03, h=0.08, z=0.98), tige_c=(0.30, 0.45, 0.15)),
    dict(id='melon', forme=ovale(0.92, 0.92, 0.96, rel=0.006),
         peau=lambda c: mix((0.90, 0.72, 0.38), (1.0, 0.85, 0.50), lis(0.25, 0.65, abs(bruit(c.p, 14)))),
         chair=lambda k, x, z, rm: (0.80, 0.82, 0.50) if k < 0.05 else ((0.99, 0.62, 0.25) if k < 0.7 else (0.97, 0.88, 0.60)),
         rough=0.6, graines=dict(c=(0.97, 0.90, 0.68), liste=pepins_ovale(30, 0, 0, 0.3, 0.32, 0.04, 0.02)['liste']),
         tige=dict(r=0.04, h=0.07, z=0.97), tige_c=(0.40, 0.40, 0.15)),
    dict(id='pomelo-rose', forme=bosses(ovale(1.0, 1.0, 0.88, plat=0.3, poire=0.12), 35, 0.012),
         peau=peau_degrade((1.0, 0.85, 0.25), (0.98, 0.62, 0.35), (0.98, 0.35, 0.40), (0.1, 1.0)),
         chair=segments(0.07, (1.0, 0.38, 0.45), (1.0, 0.58, 0.60), 11, 0.1),
         rough=0.45, graines=dict(c=(0.96, 0.92, 0.75), liste=pepins_ovale(6, 0, 0, 0.2, 0.15, 0.04)['liste']),
         tige=dict(r=0.04, h=0.05, z=0.88), tige_c=(0.30, 0.45, 0.15)),
    dict(id='citron-jaune', forme=ovale(0.66, 0.66, 1.0, poire=0.0, rel=0.01),
         peau=peau_degrade((1.0, 0.92, 0.12), (1.0, 0.86, 0.10), None, taches=(0.90, 0.80, 0.10), tf=60, ts=0.5),
         chair=segments(0.05, (1.0, 0.95, 0.45), (1.0, 0.98, 0.65), 9, 0.07),
         rough=0.3, graines=dict(c=(0.96, 0.92, 0.75), liste=pepins_ovale(5, 0, 0, 0.2, 0.3, 0.035)['liste']),
         tige=dict(r=0.025, h=0.05, z=0.98), tige_c=(0.35, 0.50, 0.15)),
    dict(id='tangor', forme=ovale(1.0, 1.0, 0.86, plat=0.5, rel=0.012),
         peau=peau_degrade((1.0, 0.42, 0.04), (1.0, 0.52, 0.05), None, taches=(0.90, 0.35, 0.03), tf=50, ts=0.45),
         chair=segments(0.05, (1.0, 0.36, 0.02), (1.0, 0.55, 0.06), 9),
         rough=0.5, graines=dict(c=(0.96, 0.92, 0.75), liste=pepins_ovale(4, 0, 0, 0.18, 0.12, 0.04)['liste']),
         tige=dict(r=0.04, h=0.05, z=0.84, feuilles=lambda bm: feuille(bm, 0.1, 0.86, 0.48, 0.16, 0.3)), tige_c=(0.18, 0.52, 0.12)),
    dict(id='grenadille-jaune', forme=ovale(0.78, 0.78, 1.0, rel=0.008),
         peau=peau_degrade((1.0, 0.82, 0.08), (1.0, 0.90, 0.20), None, taches=(0.95, 0.75, 0.10), tf=40, ts=0.55),
         chair=lambda k, x, z, rm: (1.0, 0.85, 0.15) if k < 0.04 else ((0.98, 0.96, 0.85) if k < 0.2 else mix((1.0, 0.65, 0.05), (1.0, 0.78, 0.15), k)),
         rough=0.3, graines=dict(c=(0.06, 0.05, 0.04), liste=pepins_ovale(36, 0, 0, 0.55, 0.62, 0.035, 0.03)['liste']),
         tige=dict(r=0.03, h=0.07, z=0.98), tige_c=(0.40, 0.55, 0.15)),
    dict(id='ramboutan', u=72, v=48, forme=bosses(ovale(0.80, 0.78, 1.0), 46, 0.34, 'pointe'),
         peau=lambda c: mix((0.92, 0.05, 0.14), (0.78, 0.84, 0.15), lis(0.1, 0.9, max(0, bruit(c.p, 30)))),
         chair=lambda k, x, z, rm: (0.90, 0.08, 0.15) if k < 0.07 else (0.98, 0.97, 0.94),
         rough=0.6, graines=dict(c=(0.55, 0.32, 0.15), rough=0.3, liste=noyau(0, 0, 0.32, 0.5, 0.06)['liste']),
         tige=dict(r=0.03, h=0.06, z=0.97), tige_c=(0.40, 0.50, 0.15)),
    dict(id='betterave', forme=ovale(0.82, 0.82, 0.95, poire=-0.55, rel=0.01),
         peau=lambda c: mix((0.50, 0.03, 0.28), (0.62, 0.08, 0.38), lis(-0.5, 0.8, c.z)),
         chair=lambda k, x, z, rm: (0.42, 0.02, 0.22) if k < 0.05 else (mix((0.80, 0.08, 0.45), (0.98, 0.45, 0.70), 0.5 + 0.5 * math.sin(k * 26))),
         rough=0.4, tige=dict(r=0.08, h=0.2, z=0.96, feuilles=trois_feuilles(1.05, 0.3, 0.08, 4, 0.8)), tige_c=(0.55, 0.12, 0.30)),
    dict(id='carotte', u=48, v=64, forme=ovale(0.30, 0.30, 1.0, poire=-0.85),
         peau=lambda c: mix((1.0, 0.45, 0.04), (1.0, 0.58, 0.08), 0.5 + 0.5 * math.sin(c.z * 40)),
         chair=lambda k, x, z, rm: (1.0, 0.50, 0.05) if k < 0.4 else (1.0, 0.72, 0.25),
         rough=0.45, tige=dict(r=0.06, h=0.08, z=0.98, feuilles=trois_feuilles(1.04, 0.25, 0.06, 5, 1.0)), tige_c=(0.20, 0.62, 0.15)),
    dict(id='figue-de-barbarie', u=56, v=48, forme=ovale(0.50, 0.46, 1.0, poire=-0.2, rel=0.01),
         peau=lambda c: mix(mix((0.55, 0.78, 0.18), (0.98, 0.50, 0.10), lis(-0.6, 0.2, c.z)), (0.88, 0.10, 0.42), lis(0.0, 0.8, c.z)) if bruit(c.p, 40) < 0.55 else (0.30, 0.22, 0.08),
         chair=lambda k, x, z, rm: (0.60, 0.80, 0.20) if k < 0.07 else mix((0.90, 0.08, 0.40), (0.98, 0.35, 0.60), k),
         rough=0.5, graines=dict(c=(0.10, 0.06, 0.04), liste=pepins_ovale(30, 0, 0, 0.32, 0.65, 0.025)['liste']),
         tige=dict(r=0.05, h=0.04, z=0.98), tige_c=(0.35, 0.45, 0.15)),
    dict(id='coeur-de-boeuf', u=80, v=56, forme=ecailles(ovale(0.92, 0.92, 1.0, poire=0.25), 12, 10, 0.03, False),
         peau=lambda c: mix((0.88, 0.40, 0.18), (0.60, 0.18, 0.12), lis(0.1, 0.45, motif_ecaille(c, 12, 10))),
         chair=lambda k, x, z, rm: (0.70, 0.30, 0.15) if k < 0.05 else mix((1.0, 0.90, 0.62), (1.0, 0.80, 0.48), k),
         rough=0.5, graines=dict(c=(0.12, 0.08, 0.05), liste=pepins_ovale(14, 0, 0, 0.45, 0.55, 0.04)['liste']),
         tige=dict(r=0.05, h=0.08, z=0.98), tige_c=(0.35, 0.30, 0.12)),
]
