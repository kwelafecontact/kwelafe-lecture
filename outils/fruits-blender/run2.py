import bpy
import sys, runpy
sys.path.insert(0, '/home/claude/kwelafe-lecture/outils/fruits-blender')
import specs, specs2
specs.FRUITS = specs2.NOUVEAUX
runpy.run_path('/home/claude/kwelafe-lecture/outils/fruits-blender/gen.py', run_name='__main__')
