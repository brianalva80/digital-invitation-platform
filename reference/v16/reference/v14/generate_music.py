"""Original synthesized demo cues; no sampled or third-party recordings."""
import numpy as np, wave, subprocess, tempfile
from pathlib import Path
P=Path(__file__).parent; sr=24000
# Distinct original arpeggio motifs, no existing song transcription.
tracks={'ivory-nocturne':(82,[(48,55,62,64),(45,52,59,60),(50,57,60,65),(43,55,59,62)], [0,2,1,3,1,2,3,2]),'golden-hour':(68,[(50,57,61,66),(47,54,57,62),(43,50,57,59),(45,52,59,64)],[0,1,3,2,1,3,2,1]),'garden-waltz':(96,[(53,60,64,69),(48,55,60,64),(50,57,60,65),(46,53,60,62)],[0,2,3,1,2,3])}
for name,(bpm,chords,pattern) in tracks.items():
 beat=60/bpm; step=beat/2; length=len(chords)*len(pattern)*step; y=np.zeros(int(sr*length))
 for j,chord in enumerate(chords):
  for i,k in enumerate(pattern):
   pos=int((j*len(pattern)+i)*step*sr); t=np.arange(int(sr*2.6))/sr; f=440*2**((chord[k]-69)/12); env=(1-np.exp(-t*95))*np.exp(-t*2.7); note=(np.sin(2*np.pi*f*t)+.23*np.sin(4*np.pi*f*t)+.08*np.sin(6*np.pi*f*t))*env*.095
   np.add.at(y,(pos+np.arange(len(t)))%len(y),note)
  pos=int(j*len(pattern)*step*sr); t=np.arange(int(sr*3))/sr; f=440*2**((chord[0]-69)/12); note=np.sin(2*np.pi*f*t)*(1-np.exp(-t*12))*np.exp(-t*1.3)*.055; np.add.at(y,(pos+np.arange(len(t)))%len(y),note)
 # Short circular reflections, normalize conservatively.
 y=y+.18*np.roll(y,int(sr*.19))+.09*np.roll(y,int(sr*.36)); y*=.72/max(np.max(np.abs(y)),.01)
 with tempfile.TemporaryDirectory() as td:
  f=Path(td)/'cue.wav'
  with wave.open(str(f),'wb') as w:w.setparams((1,2,sr,0,'NONE','not compressed'));w.writeframes((y*32767).astype('<i2').tobytes())
  subprocess.run(['ffmpeg','-loglevel','error','-y','-i',str(f),'-codec:a','libmp3lame','-b:a','48k',str(P/'assets'/f'{name}.mp3')],check=True)
