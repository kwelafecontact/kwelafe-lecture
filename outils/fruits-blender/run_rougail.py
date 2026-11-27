import bpy, sys, runpy, os
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
import specs, specs2, specs3, specs4
VOULUS = ['carotte', 'betterave', 'concombre', 'poivron-vert', 'poivron-rouge', 'piment-vert', 'radis', 'chou-rouge', 'citron-vert', 'chou-blanc', 'haricot-vert']
tous = {s['id']: s for s in specs2.NOUVEAUX + specs3.NOUVEAUX + specs4.NOUVEAUX}  # specs4 remplace chou-rouge et radis
specs.FRUITS = [tous[i] for i in VOULUS]
runpy.run_path(os.path.join(D, 'gen.py'), run_name='__main__')
