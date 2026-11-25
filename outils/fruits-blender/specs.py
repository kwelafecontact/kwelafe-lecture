# Fiches des 39 fruits et légumes péi de Koup Koup 2.
# forme(c, p) : c = point de la sphère d'origine (c.z de -1 à 1 = longueur, c.a angle, c.r rayon), renvoie le point déformé.
# peau(c)     : couleur sRGB du sommet (calculée sur la sphère d'origine).
# chair(k, x, z, rmax) : couleur de la face coupée (k = 0 au bord, 1 au centre ; x, z coordonnées dans la coupe).
# graines['liste'](rnd) : graines ou noyau posés sur la coupe (x, z, rayon x, rayon z, épaisseur, rotation).
import math
from mathutils import Vector, noise

def mix(a, b, t):
    t = max(0.0, min(1.0, t)); return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))
def lis(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)
def bruit(p, f, o=Vector((0, 0, 0))):
    return noise.noise(p * f + o)
def clair(c, k):
    return tuple(min(1, x * (1 + k)) for x in c)
def sombre(c, k):
    return tuple(x * (1 - k) for x in c)

# ---------------------------------------------------------------- formes de base
def ovale(sx, sy, sz, rel=0.0, f=2.0, poire=0.0, bec=0.0, courbe=0.0, plat=0.0):
    def forme(c, p):
        t = c.t
        k = 1 + poire * (t - 0.5) * -1.6                 # poire : plus fin en haut
        x, y, z = p.x * sx * k, p.y * sy * k, p.z * sz
        x += courbe * sz * (1 - c.z * c.z)               # courbe (banane, mangue)
        if bec and c.z < -0.5 and p.x < 0.1: x -= bec * (-0.5 - c.z) * 2
        if plat: z *= 1 - plat * (abs(c.z) ** 3) * 0.5
        q = Vector((x, y, z))
        if rel: q *= 1 + rel * bruit(c.p, f)
        return q
    return forme

def cotes(base, n, amp, pointe=1.0):
    """Côtes verticales (citrouille, carambole, chouchou)."""
    def forme(c, p):
        q = base(c, p)
        k = 1 - amp * (1 - abs(math.cos(n * c.a / 2)) ** pointe)
        q.x *= k; q.y *= k
        return q
    return forme

def bosses(base, freq, amp, kind='bosse'):
    def forme(c, p):
        q = base(c, p)
        n = bruit(c.p, freq)
        if kind == 'pointe': n = max(0, n) ** 0.6
        elif kind == 'verrue': n = max(0, n) ** 1.5 * 2
        return q * (1 + amp * n)
    return forme

def ecailles(base, nu, nv, amp, decal=True):
    """Écailles / alvéoles régulières (ananas, pomme-cannelle, fruit à pain, letchi)."""
    def forme(c, p):
        q = base(c, p)
        u = c.a / (2 * math.pi) * nu
        v = (c.z + 1) / 2 * nv + (0.5 * (int(u) % 2) if decal else 0)
        du, dv = u - math.floor(u) - 0.5, v - math.floor(v) - 0.5
        h = max(0, 1 - 2.2 * math.hypot(du, dv))
        lim = 1 - abs(c.z) ** 6
        return q * (1 + amp * h * lim)
    return forme

def motif_ecaille(c, nu, nv):
    u = c.a / (2 * math.pi) * nu
    v = (c.z + 1) / 2 * nv + 0.5 * (int(u) % 2)
    du, dv = u - math.floor(u) - 0.5, v - math.floor(v) - 0.5
    return math.hypot(du, dv)

# ---------------------------------------------------------------- intérieurs
def chair_simple(bord, coeur, ep=0.06, peau=None):
    def chair(k, x, z, rm):
        if peau and k < ep: return peau
        return mix(bord, coeur, lis(0, 1, k) ** 0.8)
    return chair

def noyau(x, z, rx, rz, ep=0.05, rot=0.0):
    return {'liste': lambda r: [(x, z, rx, rz, ep, rot)]}

def pepins_ovale(n, cx, cz, ax, az, taille, ep=0.03, couronne=False):
    def liste(r):
        out = []
        for i in range(n):
            if couronne:
                a = i / n * 2 * math.pi + r.uniform(-0.1, 0.1); d = r.uniform(0.85, 1.0)
            else:
                a = r.uniform(0, 2 * math.pi); d = math.sqrt(r.uniform(0.05, 1))
            out.append((cx + math.cos(a) * ax * d, cz + math.sin(a) * az * d, taille * r.uniform(0.8, 1.15), taille * 1.6 * r.uniform(0.8, 1.15), ep, a + math.pi / 2))
        return out
    return {'liste': liste}

def feuilles_ananas(bm):
    import bmesh
    for i in range(18):
        a = i / 18 * 2 * math.pi * 2.3; h = 0.35 + (i % 5) * 0.08; inc = 0.35 + (i % 3) * 0.15
        v1 = bm.verts.new((0.04 * math.cos(a + 1.5), 0.04 * math.sin(a + 1.5), 1.05))
        v2 = bm.verts.new((0.04 * math.cos(a - 1.5), 0.04 * math.sin(a - 1.5), 1.05))
        v3 = bm.verts.new((math.cos(a) * h * inc, math.sin(a) * h * inc, 1.05 + h))
        bm.faces.new((v1, v2, v3))

def feuille(bm, x=0.15, z=1.05, l=0.45, w=0.16, a=0.4):
    v = [bm.verts.new(q) for q in ((0, 0, z), (x + l * 0.5 * math.cos(a), w, z + l * 0.5 * math.sin(a)), (x + l * math.cos(a), 0, z + l * math.sin(a)), (x + l * 0.5 * math.cos(a), -w, z + l * 0.5 * math.sin(a)))]
    bm.faces.new(v)

# ---------------------------------------------------------------- peaux types
def peau_degrade(bas, haut, joue=None, cote=(0.2, 1.0), taches=None, tf=40, ts=0.55, ton=0.08):
    def peau(c):
        col = mix(bas, haut, lis(-0.9, 0.9, c.z))
        if joue:
            k = lis(cote[0], cote[1], math.cos(c.a) * 0.8 + c.z * 0.4)
            col = mix(col, joue, k * (0.8 + 0.2 * bruit(c.p, 4)))
        col = tuple(min(1, max(0, x * (1 + ton * bruit(c.p, 6)))) for x in col)
        if taches and bruit(c.p, tf) > ts: col = mix(col, taches, 0.7)
        return col
    return peau

def peau_ecailles(fond, bord, nu, nv, pointe=None):
    def peau(c):
        d = motif_ecaille(c, nu, nv)
        col = mix(fond, bord, lis(0.25, 0.48, d))
        if pointe and d < 0.08: col = pointe
        return col
    return peau

MANGUE_CHAIR = lambda coeur=(1.0, 0.52, 0.02), bord=(1.0, 0.62, 0.05): chair_simple(bord, coeur, 0.03, (0.60, 0.55, 0.15))

def mangue(id_, nom_couleurs, sx=0.78, sy=0.66, bec=0.05, courbe=0.08, chair=None, poire=0.0):
    bas, haut, joue = nom_couleurs
    return dict(id=id_, forme=ovale(sx, sy, 1.0, rel=0.012, f=2.2, bec=bec, courbe=courbe, poire=poire),
                peau=peau_degrade(bas, haut, joue, (0.1, 1.0), taches=(0.95, 0.92, 0.70), tf=55, ts=0.62),
                chair=chair or MANGUE_CHAIR(), rough=0.38,
                graines=dict(c=(0.88, 0.82, 0.58), rough=0.8, liste=noyau(0.04, 0.0, sx * 0.42, 0.62, 0.05)['liste']),
                tige=dict(r=0.035, h=0.12, z=0.98, x=0.06), tige_c=(0.30, 0.22, 0.10))

FRUITS = [
    mangue('mangue', ((0.40, 0.62, 0.14), (0.98, 0.80, 0.20), (0.88, 0.25, 0.12))),
    dict(id='letchi', forme=ecailles(ovale(0.92, 0.92, 1.0, poire=0.15), 22, 14, 0.05),
         peau=lambda c: mix(mix((0.72, 0.08, 0.12), (0.92, 0.22, 0.20), lis(0.15, 0.5, motif_ecaille(c, 22, 14))), (0.55, 0.30, 0.15), lis(0.75, 1.0, c.z) * 0.6),
         chair=lambda k, x, z, rm: (0.80, 0.18, 0.15) if k < 0.07 else mix((0.97, 0.96, 0.92), (0.90, 0.92, 0.88), k),
         rough=0.6, graines=dict(c=(0.35, 0.18, 0.08), rough=0.2, liste=noyau(0, -0.02, 0.36, 0.55, 0.06)['liste']),
         tige=dict(r=0.04, h=0.14, z=0.98), tige_c=(0.40, 0.30, 0.12)),
    dict(id='ananas', u=96, v=64, forme=ecailles(ovale(0.62, 0.62, 1.0, plat=0.5), 14, 12, 0.07),
         peau=peau_ecailles((0.95, 0.66, 0.15), (0.45, 0.30, 0.08), 14, 12, (0.30, 0.45, 0.12)),
         chair=lambda k, x, z, rm: (0.70, 0.50, 0.14) if k < 0.06 else ((1.0, 0.95, 0.70) if abs(x) < 0.12 else mix((1.0, 0.86, 0.25), (1.0, 0.92, 0.45), k)),
         rough=0.6, tige=dict(r=0.05, h=0.06, z=0.98, feuilles=feuilles_ananas), tige_c=(0.25, 0.48, 0.18)),
    dict(id='papaye', forme=ovale(0.62, 0.62, 1.0, poire=0.28, rel=0.01),
         peau=peau_degrade((0.35, 0.55, 0.15), (1.0, 0.65, 0.12), None, taches=(0.4, 0.6, 0.15), tf=12, ts=0.45),
         chair=lambda k, x, z, rm: (0.40, 0.55, 0.15) if k < 0.04 else ((0.30, 0.15, 0.08) if k > 0.72 else mix((1.0, 0.55, 0.20), (0.98, 0.42, 0.22), k)),
         rough=0.35, graines=dict(c=(0.06, 0.05, 0.05), rough=0.15, liste=pepins_ovale(34, 0, -0.05, 0.14, 0.45, 0.035, 0.04)['liste']),
         tige=dict(r=0.05, h=0.08, z=0.98), tige_c=(0.30, 0.45, 0.15)),
    dict(id='banane', u=64, v=48, forme=cotes(ovale(0.24, 0.24, 1.0, courbe=0.42), 5, 0.06, 0.6),
         peau=lambda c: mix((1.0, 0.86, 0.20), (0.35, 0.28, 0.12), lis(0.88, 1.0, abs(c.z))) if bruit(c.p, 30) < 0.62 else (0.55, 0.40, 0.15),
         chair=lambda k, x, z, rm: (0.95, 0.85, 0.30) if k < 0.08 else mix((1.0, 0.96, 0.82), (0.95, 0.90, 0.70), k),
         rough=0.45, tige=dict(r=0.05, h=0.18, z=0.98, x=0.42 * 0.0), tige_c=(0.40, 0.32, 0.12)),
    dict(id='carambole', forme=cotes(ovale(0.62, 0.62, 1.0, plat=0.4), 10, 0.48, 1.6),
         peau=peau_degrade((0.80, 0.82, 0.20), (1.0, 0.82, 0.18), None),
         chair=lambda k, x, z, rm: mix((1.0, 0.85, 0.25), (1.0, 0.92, 0.55), k),
         rough=0.25, graines=dict(c=(0.55, 0.40, 0.20), liste=pepins_ovale(4, 0, 0, 0.05, 0.35, 0.03)['liste']),
         tige=dict(r=0.03, h=0.08, z=0.98), tige_c=(0.40, 0.35, 0.15)),
    dict(id='fruit-de-la-passion', forme=ovale(0.92, 0.92, 1.0, rel=0.01),
         peau=peau_degrade((0.30, 0.10, 0.25), (0.45, 0.15, 0.32), None, taches=(0.75, 0.60, 0.70), tf=30, ts=0.6),
         chair=lambda k, x, z, rm: (0.95, 0.92, 0.85) if k < 0.12 else (0.96, 0.72, 0.10),
         rough=0.45, graines=dict(c=(0.10, 0.07, 0.05), liste=pepins_ovale(40, 0, 0, 0.55, 0.6, 0.035, 0.03)['liste']),
         tige=dict(r=0.03, h=0.08, z=0.98), tige_c=(0.40, 0.45, 0.20)),
    dict(id='goyavier', forme=ovale(0.95, 0.95, 1.0, rel=0.01),
         peau=peau_degrade((0.78, 0.10, 0.20), (0.62, 0.05, 0.15), None, taches=(0.90, 0.40, 0.45), tf=40, ts=0.6),
         chair=lambda k, x, z, rm: (0.75, 0.10, 0.18) if k < 0.05 else mix((0.98, 0.94, 0.92), (0.96, 0.88, 0.86), k),
         rough=0.3, graines=dict(c=(0.90, 0.85, 0.70), liste=pepins_ovale(14, 0, 0, 0.4, 0.4, 0.04)['liste']),
         tige=dict(r=0.06, h=0.05, z=0.96), tige_c=(0.25, 0.12, 0.10)),
    dict(id='jacque', u=96, v=64, forme=bosses(ovale(0.62, 0.62, 1.0), 26, 0.05, 'pointe'),
         peau=lambda c: mix((0.45, 0.58, 0.18), (0.68, 0.70, 0.25), lis(-0.2, 0.6, bruit(c.p, 26))),
         chair=lambda k, x, z, rm: (0.70, 0.75, 0.40) if k < 0.05 else ((1.0, 0.75, 0.15) if bruit(Vector((x, z, 0)), 9) > -0.1 else (0.96, 0.92, 0.75)),
         rough=0.7, tige=dict(r=0.06, h=0.12, z=0.98), tige_c=(0.35, 0.32, 0.15)),
    dict(id='chouchou', forme=cotes(ovale(0.70, 0.62, 1.0, poire=0.25), 5, 0.12, 0.8),
         peau=peau_degrade((0.62, 0.82, 0.38), (0.72, 0.88, 0.45), None, taches=(0.85, 0.95, 0.70), tf=20, ts=0.6),
         chair=lambda k, x, z, rm: mix((0.85, 0.95, 0.75), (0.95, 0.98, 0.88), k),
         rough=0.3, graines=dict(c=(0.95, 0.96, 0.85), rough=0.6, liste=noyau(0, 0.05, 0.18, 0.35, 0.03)['liste']),
         tige=dict(r=0.04, h=0.1, z=0.98), tige_c=(0.40, 0.55, 0.25)),
    dict(id='piment', u=48, v=48, forme=ovale(0.28, 0.28, 1.0, courbe=0.15, poire=-0.6),
         peau=peau_degrade((0.85, 0.06, 0.05), (0.90, 0.10, 0.06), None),
         chair=lambda k, x, z, rm: (0.88, 0.12, 0.08) if k < 0.2 else (1.0, 0.85, 0.70),
         rough=0.15, graines=dict(c=(0.98, 0.90, 0.60), liste=pepins_ovale(10, 0, 0.2, 0.05, 0.5, 0.025)['liste']),
         tige=dict(r=0.05, h=0.22, z=0.98, x=0.0, pente=0.4), tige_c=(0.20, 0.50, 0.15)),
    dict(id='citrouille', forme=cotes(ovale(1.0, 1.0, 0.72, plat=0.8), 10, 0.10, 0.9),
         peau=lambda c: mix((0.95, 0.52, 0.10), (0.85, 0.42, 0.08), (abs(math.cos(5 * c.a)) ** 6) * 0.6),
         chair=lambda k, x, z, rm: (0.70, 0.45, 0.10) if k < 0.04 else ((0.98, 0.70, 0.30) if k > 0.55 else mix((1.0, 0.58, 0.12), (1.0, 0.65, 0.20), k)),
         rough=0.45, graines=dict(c=(0.96, 0.92, 0.75), liste=pepins_ovale(18, 0, 0, 0.35, 0.25, 0.05, 0.02)['liste']),
         tige=dict(r=0.08, h=0.2, z=0.68, pente=0.2), tige_c=(0.40, 0.42, 0.20)),
    dict(id='fruit-a-pain', u=96, v=64, forme=ecailles(ovale(0.92, 0.92, 1.0), 18, 12, 0.03, False),
         peau=lambda c: mix((0.50, 0.68, 0.18), (0.38, 0.55, 0.12), lis(0.3, 0.5, motif_ecaille(c, 18, 12))),
         chair=lambda k, x, z, rm: (0.55, 0.65, 0.25) if k < 0.04 else mix((0.98, 0.95, 0.80), (0.96, 0.88, 0.65), k),
         rough=0.6, tige=dict(r=0.05, h=0.12, z=0.98), tige_c=(0.35, 0.30, 0.12)),
    dict(id='avocat', forme=bosses(ovale(0.66, 0.66, 1.0, poire=0.35), 20, 0.012),
         peau=peau_degrade((0.18, 0.30, 0.10), (0.22, 0.35, 0.12), None, taches=(0.30, 0.45, 0.15), tf=25, ts=0.5),
         chair=lambda k, x, z, rm: (0.20, 0.35, 0.10) if k < 0.04 else mix((0.68, 0.82, 0.30), (0.95, 0.92, 0.55), k ** 0.8),
         rough=0.55, graines=dict(c=(0.55, 0.35, 0.18), rough=0.3, liste=noyau(0, -0.15, 0.32, 0.38, 0.1)['liste']),
         tige=dict(r=0.03, h=0.06, z=0.98), tige_c=(0.30, 0.25, 0.10)),
    dict(id='corossol', u=96, v=64, forme=bosses(ovale(0.66, 0.66, 1.0, poire=0.2, courbe=0.1), 22, 0.07, 'pointe'),
         peau=lambda c: mix((0.25, 0.45, 0.12), (0.45, 0.62, 0.20), lis(0, 0.6, bruit(c.p, 22))),
         chair=lambda k, x, z, rm: (0.35, 0.50, 0.15) if k < 0.04 else (0.98, 0.97, 0.94),
         rough=0.6, graines=dict(c=(0.12, 0.08, 0.05), liste=pepins_ovale(16, 0, 0, 0.35, 0.6, 0.035)['liste']),
         tige=dict(r=0.05, h=0.1, z=0.98), tige_c=(0.30, 0.25, 0.10)),
    dict(id='pitaya', u=72, v=48, forme=ecailles(ovale(0.78, 0.78, 1.0), 9, 7, 0.08),
         peau=lambda c: mix((0.88, 0.12, 0.42), (0.55, 0.75, 0.25), lis(0.06, 0.02, motif_ecaille(c, 9, 7)) * 0 + (1 - lis(0.0, 0.09, motif_ecaille(c, 9, 7))) * 0.8),
         chair=lambda k, x, z, rm: (0.90, 0.20, 0.45) if k < 0.05 else (0.98, 0.97, 0.95),
         rough=0.35, graines=dict(c=(0.05, 0.05, 0.05), liste=pepins_ovale(90, 0, 0, 0.6, 0.75, 0.018, 0.01)['liste'])),
    dict(id='longani', forme=ovale(0.95, 0.95, 1.0, rel=0.01),
         peau=peau_degrade((0.76, 0.62, 0.38), (0.70, 0.55, 0.32), None, taches=(0.60, 0.45, 0.25), tf=30, ts=0.55),
         chair=lambda k, x, z, rm: (0.70, 0.55, 0.30) if k < 0.05 else (0.95, 0.94, 0.88),
         rough=0.65, graines=dict(c=(0.10, 0.06, 0.04), rough=0.15, liste=noyau(0, 0, 0.35, 0.35, 0.08)['liste']),
         tige=dict(r=0.04, h=0.1, z=0.98), tige_c=(0.40, 0.32, 0.18)),
    dict(id='evi', forme=ovale(0.78, 0.74, 1.0, rel=0.015),
         peau=peau_degrade((0.55, 0.70, 0.20), (0.90, 0.78, 0.25), None, taches=(0.70, 0.60, 0.25), tf=35, ts=0.6),
         chair=lambda k, x, z, rm: (0.60, 0.70, 0.25) if k < 0.04 else (0.95, 0.88, 0.45),
         rough=0.4, graines=dict(c=(0.72, 0.62, 0.38), rough=0.9, liste=noyau(0, 0, 0.4, 0.6, 0.06)['liste']),
         tige=dict(r=0.035, h=0.1, z=0.98), tige_c=(0.35, 0.30, 0.12)),
    dict(id='goyave', forme=ovale(0.86, 0.86, 1.0, poire=0.18, rel=0.015),
         peau=peau_degrade((0.75, 0.82, 0.30), (0.92, 0.88, 0.40), None, taches=(0.55, 0.60, 0.20), tf=30, ts=0.6),
         chair=lambda k, x, z, rm: (0.80, 0.85, 0.40) if k < 0.05 else mix((0.98, 0.50, 0.50), (0.96, 0.38, 0.42), k),
         rough=0.45, graines=dict(c=(0.95, 0.85, 0.65), liste=pepins_ovale(26, 0, 0, 0.35, 0.4, 0.03)['liste']),
         tige=dict(r=0.06, h=0.05, z=0.97), tige_c=(0.30, 0.25, 0.12)),
    dict(id='tamarin', u=48, v=72, forme=bosses(ovale(0.20, 0.13, 1.0, courbe=0.25), 6, 0.10),
         peau=peau_degrade((0.62, 0.45, 0.28), (0.55, 0.40, 0.24), None, taches=(0.45, 0.32, 0.20), tf=12, ts=0.3),
         chair=lambda k, x, z, rm: (0.60, 0.42, 0.25) if k < 0.1 else (0.48, 0.25, 0.10),
         rough=0.8, graines=dict(c=(0.25, 0.12, 0.05), rough=0.2, liste=lambda r: [(0.05 + 0.25 * (1 - (z * z)) * 0.42, z * 0.8, 0.08, 0.11, 0.04, 0) for z in (-0.6, -0.2, 0.2, 0.6)]),
         tige=dict(r=0.03, h=0.08, z=0.98), tige_c=(0.40, 0.30, 0.18)),
    dict(id='bibasse', forme=ovale(0.84, 0.84, 1.0, poire=-0.08, rel=0.01),
         peau=peau_degrade((1.0, 0.68, 0.18), (0.95, 0.60, 0.15), None, taches=(0.80, 0.45, 0.15), tf=30, ts=0.6),
         chair=lambda k, x, z, rm: (0.98, 0.65, 0.20) if k < 0.05 else (1.0, 0.75, 0.35),
         rough=0.4, graines=dict(c=(0.40, 0.22, 0.10), rough=0.2, liste=pepins_ovale(3, 0, 0, 0.12, 0.15, 0.13, 0.06, True)['liste']),
         tige=dict(r=0.035, h=0.1, z=0.98), tige_c=(0.40, 0.30, 0.18)),
    dict(id='jamrosa', forme=ovale(0.92, 0.92, 0.9, poire=-0.25, plat=0.6),
         peau=peau_degrade((0.98, 0.92, 0.55), (0.95, 0.75, 0.60), None),
         chair=lambda k, x, z, rm: (0.95, 0.85, 0.55) if k < 0.25 else (0.75, 0.62, 0.38),
         rough=0.3, graines=dict(c=(0.55, 0.38, 0.20), liste=noyau(0, 0, 0.3, 0.3, 0.08)['liste']),
         tige=dict(r=0.04, h=0.12, z=0.88), tige_c=(0.45, 0.50, 0.25)),
    dict(id='pomme-cannelle', u=80, v=56, forme=ecailles(ovale(0.95, 0.95, 1.0, poire=-0.15), 12, 9, 0.08),
         peau=peau_ecailles((0.65, 0.80, 0.42), (0.80, 0.85, 0.65), 12, 9),
         chair=lambda k, x, z, rm: (0.55, 0.70, 0.35) if k < 0.05 else (0.98, 0.96, 0.90),
         rough=0.6, graines=dict(c=(0.10, 0.07, 0.05), liste=pepins_ovale(14, 0, 0, 0.5, 0.55, 0.04)['liste']),
         tige=dict(r=0.05, h=0.1, z=0.98), tige_c=(0.35, 0.30, 0.15)),
    dict(id='coco', forme=bosses(ovale(0.92, 0.92, 1.0), 8, 0.02),
         peau=lambda c: mix((0.45, 0.30, 0.18), (0.30, 0.18, 0.10), lis(-0.3, 0.6, bruit(c.p, 30))),
         chair=lambda k, x, z, rm: (0.40, 0.25, 0.12) if k < 0.08 else ((0.98, 0.98, 0.95) if k < 0.3 else (0.85, 0.92, 0.95)),
         rough=0.9, tige=None),
    dict(id='combava', forme=bosses(ovale(0.95, 0.95, 1.0, poire=0.1), 9, 0.08, 'verrue'),
         peau=peau_degrade((0.18, 0.40, 0.10), (0.22, 0.45, 0.12), None),
         chair=lambda k, x, z, rm: (0.95, 0.96, 0.85) if k < 0.12 else mix((0.80, 0.88, 0.50), (0.88, 0.92, 0.60), k),
         rough=0.35, graines=dict(c=(0.95, 0.92, 0.75), liste=pepins_ovale(6, 0, 0, 0.2, 0.3, 0.04)['liste']),
         tige=dict(r=0.035, h=0.06, z=0.98), tige_c=(0.30, 0.40, 0.12)),
    dict(id='citron-galet', forme=ovale(0.95, 0.95, 1.0, rel=0.01),
         peau=peau_degrade((0.35, 0.62, 0.15), (0.55, 0.72, 0.20), None, taches=(0.25, 0.50, 0.12), tf=60, ts=0.5),
         chair=lambda k, x, z, rm: (0.95, 0.96, 0.85) if k < 0.08 else ((0.95, 0.97, 0.85) if abs(math.sin(math.atan2(z, x) * 5)) < 0.07 else (0.80, 0.90, 0.40)),
         rough=0.3, graines=dict(c=(0.95, 0.92, 0.75), liste=pepins_ovale(5, 0, 0, 0.18, 0.18, 0.035)['liste']),
         tige=dict(r=0.03, h=0.05, z=0.98), tige_c=(0.30, 0.40, 0.12)),
    dict(id='mandarine', forme=ovale(1.0, 1.0, 0.82, plat=0.6, rel=0.01),
         peau=peau_degrade((1.0, 0.55, 0.08), (0.98, 0.50, 0.06), None, taches=(0.85, 0.42, 0.05), tf=70, ts=0.4),
         chair=lambda k, x, z, rm: (0.98, 0.92, 0.80) if k < 0.08 else ((0.99, 0.90, 0.75) if abs(math.sin(math.atan2(z, x) * 5)) < 0.06 else (1.0, 0.58, 0.10)),
         rough=0.45, graines=dict(c=(0.96, 0.92, 0.75), liste=pepins_ovale(4, 0, 0, 0.15, 0.12, 0.04)['liste']),
         tige=dict(r=0.04, h=0.06, z=0.8, feuilles=lambda bm: feuille(bm, 0.1, 0.82, 0.5, 0.17, 0.3)), tige_c=(0.20, 0.42, 0.12)),
    dict(id='margoze', u=64, v=72, forme=bosses(cotes(ovale(0.36, 0.36, 1.0, poire=-0.3), 10, 0.10), 18, 0.08, 'verrue'),
         peau=lambda c: mix((0.35, 0.62, 0.20), (0.55, 0.78, 0.30), lis(0, 0.6, bruit(c.p, 18))),
         chair=lambda k, x, z, rm: (0.55, 0.75, 0.30) if k < 0.12 else ((0.98, 0.98, 0.92) if k < 0.6 else (0.92, 0.95, 0.85)),
         rough=0.35, graines=dict(c=(0.95, 0.92, 0.80), liste=pepins_ovale(12, 0, 0, 0.06, 0.65, 0.05)['liste']),
         tige=dict(r=0.04, h=0.12, z=0.98), tige_c=(0.35, 0.50, 0.20)),
    dict(id='bringelle', forme=ovale(0.48, 0.48, 1.0, poire=-0.45, courbe=0.06),
         peau=peau_degrade((0.25, 0.08, 0.25), (0.30, 0.10, 0.30), None),
         chair=lambda k, x, z, rm: (0.35, 0.12, 0.32) if k < 0.03 else (0.96, 0.95, 0.85),
         rough=0.12, graines=dict(c=(0.75, 0.65, 0.40), liste=pepins_ovale(40, 0, -0.2, 0.25, 0.55, 0.018, 0.01)['liste']),
         tige=dict(r=0.12, r2=0.04, h=0.3, z=0.9, feuilles=lambda bm: [feuille(bm, 0, 0.92, 0.3, 0.12, a) for a in (-0.6, 0.0)]), tige_c=(0.30, 0.45, 0.20)),
    dict(id='tomate', forme=cotes(ovale(1.0, 1.0, 0.82, plat=0.5), 6, 0.04, 0.6),
         peau=peau_degrade((0.92, 0.12, 0.08), (0.85, 0.12, 0.07), None),
         chair=lambda k, x, z, rm: (0.90, 0.15, 0.10) if k < 0.12 else ((0.98, 0.55, 0.40) if bruit(Vector((x, z, 0)), 4) > 0.2 else (0.92, 0.25, 0.18)),
         rough=0.12, graines=dict(c=(0.98, 0.90, 0.55), liste=pepins_ovale(24, 0, 0, 0.45, 0.4, 0.025, 0.01)['liste']),
         tige=dict(r=0.05, h=0.08, z=0.8, feuilles=lambda bm: [feuille(bm, 0, 0.82, 0.3, 0.07, a) for a in (0.1, 0.1)]), tige_c=(0.22, 0.45, 0.15)),
    dict(id='songe', forme=bosses(ovale(0.72, 0.72, 1.0, poire=0.2), 7, 0.06),
         peau=lambda c: mix((0.45, 0.32, 0.20), (0.30, 0.20, 0.12), abs(math.sin(c.z * 14)) ** 4),
         chair=lambda k, x, z, rm: (0.40, 0.28, 0.18) if k < 0.04 else ((0.75, 0.62, 0.80) if bruit(Vector((x * 3, z * 3, 0)), 6) > 0.35 else (0.96, 0.94, 0.92)),
         rough=0.85, tige=dict(r=0.1, r2=0.05, h=0.1, z=0.98), tige_c=(0.55, 0.40, 0.45)),
    dict(id='vanille', u=40, v=72, forme=ovale(0.10, 0.07, 1.0, courbe=0.05),
         peau=lambda c: mix((0.22, 0.12, 0.06), (0.30, 0.18, 0.08), lis(-0.4, 0.6, bruit(c.p, 20))),
         chair=lambda k, x, z, rm: (0.20, 0.10, 0.05) if k < 0.3 else (0.08, 0.05, 0.03),
         rough=0.35, tige=dict(r=0.03, h=0.06, z=0.98), tige_c=(0.25, 0.15, 0.08)),
    mangue('mangue-carotte', ((0.95, 0.70, 0.12), (1.0, 0.62, 0.10), (0.98, 0.50, 0.08)), sx=0.5, sy=0.46, courbe=0.14, bec=0.08),
    mangue('mangue-auguste', ((0.45, 0.65, 0.18), (0.80, 0.80, 0.25), (0.95, 0.65, 0.18)), sx=0.84, sy=0.76, courbe=0.05, bec=0.02),
    mangue('mangue-cogshall', ((0.35, 0.50, 0.15), (0.85, 0.20, 0.18), (0.70, 0.10, 0.20)), sx=0.74, sy=0.66, courbe=0.06),
    mangue('mangue-emile', ((0.30, 0.55, 0.14), (0.55, 0.70, 0.20), (0.90, 0.75, 0.25)), sx=0.72, sy=0.62, courbe=0.1, bec=0.06),
    mangue('mangue-lucie', ((0.55, 0.65, 0.18), (0.98, 0.78, 0.20), (0.92, 0.35, 0.18)), sx=0.8, sy=0.7, courbe=0.07, bec=0.04),
    dict(id='figue-sucree', u=56, v=48, forme=cotes(ovale(0.30, 0.30, 1.0, courbe=0.25), 5, 0.06, 0.6),
         peau=lambda c: mix((1.0, 0.82, 0.18), (0.30, 0.22, 0.10), lis(0.85, 1.0, abs(c.z))) if bruit(c.p, 26) < 0.5 else (0.45, 0.32, 0.12),
         chair=lambda k, x, z, rm: (0.95, 0.82, 0.30) if k < 0.08 else (1.0, 0.94, 0.78),
         rough=0.45, tige=dict(r=0.05, h=0.14, z=0.98), tige_c=(0.40, 0.32, 0.12)),
    dict(id='jambos-rouge', forme=cotes(ovale(0.78, 0.78, 1.0, poire=-0.35, plat=0.5), 4, 0.05), u=72, v=48,
         peau=peau_degrade((0.85, 0.10, 0.18), (0.70, 0.05, 0.15), None),
         chair=lambda k, x, z, rm: (0.80, 0.15, 0.20) if k < 0.05 else mix((0.98, 0.95, 0.92), (0.96, 0.90, 0.88), k),
         rough=0.15, graines=dict(c=(0.55, 0.40, 0.22), liste=noyau(0, 0.1, 0.25, 0.25, 0.08)['liste']),
         tige=dict(r=0.04, h=0.08, z=0.98), tige_c=(0.40, 0.25, 0.15)),
]
