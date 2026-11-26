import bpy
import sys, runpy
sys.path.insert(0, '/home/claude/kwelafe-lecture/outils/fruits-blender')
import specs, specs3
specs.FRUITS = specs3.NOUVEAUX
runpy.run_path('/home/claude/kwelafe-lecture/outils/fruits-blender/gen.py', run_name='__main__')
