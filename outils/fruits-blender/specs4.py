# Légumes ajoutés pour Koup Rougail v2 (achards de légumes) : chou blanc et haricot vert.
# Recette des achards : chou blanc, haricots verts, carottes, oignons (france.fr, ileauxepices.com).
import math
from specs import *

def chou(fonce, clair_, coeur, tige_c, coupe_a, coupe_b):
    # grandes feuilles qui se recouvrent, avec leurs nervures (plus naturel qu'une grille)
    def forme(c, p):
        q = ovale(1.0, 1.0, 0.9, rel=0.02)(c, p)
        a = c.a * 3 + c.z * 1.4
        f = abs(math.sin(a)) ** 0.5
        return q * (1 + 0.035 * f * (1 - abs(c.z) ** 4) + 0.02 * bruit(c.p, 5))
    def peau(c):
        a = c.a * 3 + c.z * 1.4
        nerv = lis(0.82, 1.0, abs(math.cos(c.a * 9 + c.z * 2 + bruit(c.p, 3) * 0.8)))
        bord = lis(0.0, 0.35, abs(math.sin(a)))
        col = mix(fonce, clair_, 0.35 + 0.45 * bord + 0.2 * bruit(c.p, 6))
        col = mix(col, coeur, lis(0.4, 1.0, c.z) * 0.6)
        return mix(col, clair(clair_, 0.12), nerv * 0.55)
    def chair(k, x, z, rm):
        return mix(coupe_a, coupe_b, 0.5 + 0.5 * math.sin(k * 26 + math.sin(x * 7 + z * 3) * 1.8))
    return dict(u=96, v=64, forme=forme, peau=peau, chair=chair, rough=0.45, tige=dict(r=0.09, h=0.05, z=0.88), tige_c=tige_c)

NOUVEAUX = [
    dict(id='chou-blanc', **chou((0.55, 0.74, 0.36), (0.86, 0.93, 0.70), (0.93, 0.96, 0.82), (0.78, 0.86, 0.60), (0.78, 0.88, 0.60), (0.98, 0.98, 0.90))),
    dict(id='chou-rouge', **chou((0.36, 0.08, 0.42), (0.62, 0.34, 0.66), (0.70, 0.45, 0.72), (0.55, 0.35, 0.50), (0.45, 0.05, 0.45), (0.95, 0.85, 0.95))),
    dict(id='radis', u=48, v=56, forme=ovale(0.62, 0.62, 0.8, poire=-0.45, rel=0.006),
         peau=lambda c: mix((0.98, 0.92, 0.92), mix((0.86, 0.06, 0.22), (0.96, 0.18, 0.32), 0.5 + 0.5 * bruit(c.p, 8)), lis(-0.85, -0.45, c.z)),
         chair=lambda k, x, z, rm: (0.90, 0.10, 0.25) if k < 0.06 else (0.99, 0.97, 0.96),
         rough=0.3, tige=dict(r=0.04, h=0.12, z=0.83, feuilles=__import__('specs2').trois_feuilles(0.95, 0.28, 0.07, 4, 1.0)), tige_c=(0.20, 0.58, 0.15)),
    dict(id='haricot-vert', u=32, v=72, forme=bosses(ovale(0.17, 0.14, 1.0, courbe=0.18), 6, 0.04),
         peau=lambda c: mix((0.20, 0.52, 0.12), (0.34, 0.66, 0.20), lis(-0.9, 0.9, c.z) * 0.6 + 0.4 * (0.5 + 0.5 * bruit(c.p, 12))),
         chair=lambda k, x, z, rm: (0.22, 0.55, 0.14) if k < 0.18 else (0.78, 0.90, 0.62),
         rough=0.35, graines=dict(c=(0.92, 0.94, 0.82), liste=lambda r: [(0.03 + 0.18 * (1 - ((-0.7 + i * 0.28) ** 2)) * 0.5, -0.7 + i * 0.28, 0.035, 0.05, 0.02, 0) for i in range(6)]),
         tige=dict(r=0.025, h=0.08, z=0.99, r2=0.008, pente=0.6), tige_c=(0.30, 0.50, 0.15)),
]
