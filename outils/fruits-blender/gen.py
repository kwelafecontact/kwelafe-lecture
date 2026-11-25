# Générateur de fruits 3D pour Koup Koup 2 (Blender en module Python).
# Chaque fruit : vide « entier » + vides « moitie_A » / « moitie_B » coupés en long.
# La coupe se fait suivant le plan de normale Y de Blender (= axe Z du glTF), comme les anciens modèles.
import bpy, bmesh, math, random, sys, os, json
from mathutils import Vector, noise
from specs import FRUITS

SORTIE = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/home/claude/fruits/out'
SEULS = sys.argv[sys.argv.index('--') + 2].split(',') if '--' in sys.argv and len(sys.argv) > sys.argv.index('--') + 2 else None
os.makedirs(SORTIE, exist_ok=True)


def vider():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def materiau(nom, rough=0.4, coat=0.0, trans=0.0):
    m = bpy.data.materials.new(nom); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = rough
    if coat and 'Coat Weight' in b.inputs: b.inputs['Coat Weight'].default_value = coat
    a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = 'Col'
    nt.links.new(a.outputs['Color'], b.inputs['Base Color'])
    if trans:
        b.inputs['Alpha'].default_value = 1 - trans
    return m


def materiau_uni(nom, rgb, rough=0.5):
    m = bpy.data.materials.new(nom); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*srgb_lin(rgb), 1); b.inputs['Roughness'].default_value = rough
    return m


def srgb_lin(c):
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


def mix(a, b, t):
    t = max(0.0, min(1.0, t)); return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def lisse(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)


class Ctx:
    """Infos d'un sommet pour les fonctions de forme et de couleur."""
    def __init__(self, p):
        self.p = p
        self.z = p.z                                   # -1 bas … 1 haut (axe de longueur)
        self.t = (p.z + 1) / 2
        self.a = math.atan2(p.y, p.x)                 # angle autour de l'axe
        self.r = math.hypot(p.x, p.y)


def construire_peau(s):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=s.get('u', 72), v_segments=s.get('v', 48), radius=1.0)
    forme = s['forme']
    bm.verts.ensure_lookup_table()
    orig = [v.co.copy() for v in bm.verts]
    for v in bm.verts:
        v.co = forme(Ctx(v.co.copy()), v.co.copy())
    cl = bm.loops.layers.color.new('Col')
    peau = s['peau']
    cache = {}
    for f in bm.faces:
        for l in f.loops:
            i = l.vert.index
            if i not in cache:
                cache[i] = peau(Ctx(orig[i]))
            l[cl] = (*cache[i], 1)
    return bm


def mesh_depuis(bm, nom, mat, lisse_=True):
    me = bpy.data.meshes.new(nom); bm.to_mesh(me)
    if lisse_:
        for p in me.polygons: p.use_smooth = True
    me.materials.append(mat)
    # bmesh écrit les couleurs en espace linéaire ; on les veut en sRGB tels que donnés
    ca = me.color_attributes.get('Col')
    if ca:
        me.color_attributes.active_color = ca
        me.color_attributes.render_color_index = me.color_attributes.find('Col')
        for d in ca.data:
            c = d.color; d.color_srgb = (c[0], c[1], c[2], 1)
    return me


def ajouter(nom, me, parent):
    o = bpy.data.objects.new(nom, me); bpy.context.scene.collection.objects.link(o); o.parent = parent; return o


def vide(nom):
    o = bpy.data.objects.new(nom, None); bpy.context.scene.collection.objects.link(o); return o


def bouchon(bm_moitie, s, cote):
    """Face coupée : anneaux concentriques qui suivent le bord de la coupe (plan y = 0)."""
    bords = [e for e in bm_moitie.edges if e.is_boundary]
    if not bords: return None
    # ordonner la boucle de bord
    adj = {}
    for e in bords:
        a, b = e.verts; adj.setdefault(a, []).append(b); adj.setdefault(b, []).append(a)
    depart = bords[0].verts[0]; boucle = [depart]; prec = None; cur = depart
    while True:
        voisins = [w for w in adj[cur] if w is not prec]
        if not voisins: break
        nxt = voisins[0]
        if nxt is depart: break
        boucle.append(nxt); prec, cur = cur, nxt
        if len(boucle) > 4000: break
    pts = [Vector((v.co.x, 0.0, v.co.z)) for v in boucle]
    n = len(pts)
    centre = s.get('centre_coupe', None)
    c = Vector(centre) if centre else sum(pts, Vector()) / n
    c.y = 0
    anneaux = s.get('anneaux', 18)
    bm = bmesh.new(); cl = bm.loops.layers.color.new('Col')
    grille = []
    for k in range(anneaux + 1):
        f = 1 - k / anneaux
        grille.append([bm.verts.new(c + (p - c) * f) for p in pts] if k < anneaux else [bm.verts.new(c)])
    for k in range(anneaux - 1):
        A, B = grille[k], grille[k + 1]
        for i in range(n):
            j = (i + 1) % n
            try: bm.faces.new((A[i], A[j], B[j], B[i]))
            except ValueError: pass
    C = grille[-1][0]; A = grille[-2]
    for i in range(n):
        try: bm.faces.new((A[i], A[(i + 1) % n], C))
        except ValueError: pass
    bm.normal_update()
    # la face doit regarder vers l'extérieur de la moitié (cote = +1 : vers +y)
    for f in bm.faces:
        if (f.normal.y > 0) != (cote < 0): f.normal_flip()
    # couleur : k = 0 au bord, 1 au centre
    chair = s['chair']
    rmax = max((p - c).length for p in pts) or 1
    for kk, anneau in enumerate(grille):
        for v in anneau: v.tag = False
    prof = {}
    for kk, anneau in enumerate(grille):
        for v in anneau: prof[v] = kk / anneaux
    for f in bm.faces:
        for l in f.loops:
            v = l.vert
            l[cl] = (*chair(prof[v], v.co.x, v.co.z, rmax), 1)
    # léger bombé de la chair pour accrocher la lumière
    for v in bm.verts:
        v.co.y = -cote * 0.012 * math.sin(prof[v] * math.pi / 2)
    return bm


def graines(parent, nom, s, cote, mat_g):
    """Graines / noyau posés sur la face coupée."""
    g = s.get('graines')
    if not g: return
    random.seed(hash(s['id']) % 1000 + (1 if cote > 0 else 2))
    objs = []
    for i, (x, z, rx, rz, ep, rot) in enumerate(g['liste'](random)):
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=1)
        for v in bm.verts:
            vx, vz = v.co.x * rx, v.co.z * rz
            cx, sx = math.cos(rot), math.sin(rot)
            v.co = Vector((x + vx * cx - vz * sx, -cote * (0.01 + ep * (-v.co.y * cote + 1) * 0.5), z + vx * sx + vz * cx))
        me = bpy.data.meshes.new(f'{nom}_g{i}'); bm.to_mesh(me); bm.free()
        for p in me.polygons: p.use_smooth = True
        me.materials.append(mat_g)
        objs.append(me)
    # fusion en un seul objet
    bm = bmesh.new()
    for me in objs: bm.from_mesh(me)
    me = bpy.data.meshes.new(nom + '_graines'); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    me.materials.append(mat_g)
    ajouter(nom + '_extra1', me, parent)


def tige(parent, nom, s, mat_t):
    t = s.get('tige')
    if not t: return
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=t.get('r', 0.05), radius2=t.get('r2', t.get('r', 0.05) * 0.8), depth=t.get('h', 0.15))
    for v in bm.verts:
        v.co.z += t.get('z', 1.0) + t.get('h', 0.15) / 2 - 0.02
        v.co.x += t.get('x', 0.0) + (v.co.z - t.get('z', 1.0)) * t.get('pente', 0.0)
    if t.get('feuilles'):
        t['feuilles'](bm)
    me = bpy.data.meshes.new(nom + '_tige'); bm.to_mesh(me); bm.free()
    me.materials.append(mat_t)
    ajouter(nom + '_extra0', me, parent)


def fruit(s):
    vider()
    id_ = s['id']
    M_PEAU = materiau(id_ + '_peau', s.get('rough', 0.4))
    M_CHAIR = materiau(id_ + '_chair', s.get('rough_chair', 0.3))
    M_TIGE = materiau_uni(id_ + '_tige', s.get('tige_c', (0.30, 0.20, 0.10)), 0.7)
    M_GR = materiau_uni(id_ + '_graine', s.get('graines', {}).get('c', (0.15, 0.08, 0.04)), s.get('graines', {}).get('rough', 0.35))
    bm = construire_peau(s)
    me_peau = mesh_depuis(bm.copy(), 'entier_peau', M_PEAU)
    E = vide('entier'); ajouter('entier_peau', me_peau, E); tige(E, 'entier', s, M_TIGE)
    for nom, cote in (('moitie_A', 1), ('moitie_B', -1)):
        b2 = bm.copy()
        geom = b2.verts[:] + b2.edges[:] + b2.faces[:]
        bmesh.ops.bisect_plane(b2, geom=geom, plane_co=(0, 0, 0), plane_no=(0, 1, 0), clear_inner=(cote > 0), clear_outer=(cote < 0))
        V = vide(nom)
        cap = bouchon(b2, s, cote)
        ajouter(nom + '_peau', mesh_depuis(b2, nom + '_peau', M_PEAU), V)
        if cap: ajouter(nom + '_chair', mesh_depuis(cap, nom + '_chair', M_CHAIR), V)
        graines(V, nom, s, cote, M_GR)
        if s.get('tige_moities', True): tige(V, nom, s, M_TIGE)
        b2.free()
    bm.free()
    chemin = os.path.join(SORTIE, s['id'] + '.glb')
    bpy.ops.export_scene.gltf(filepath=chemin, export_format='GLB', export_yup=True, export_apply=True,
                              export_vertex_color='ACTIVE', export_all_vertex_colors=True, export_materials='EXPORT', export_extras=False)
    return chemin


if __name__ == '__main__':
    faits = []
    for s in FRUITS:
        if SEULS and s['id'] not in SEULS: continue
        faits.append(fruit(s))
    print('FAITS', len(faits))
