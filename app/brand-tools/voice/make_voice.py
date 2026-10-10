"""Озвучка промо-ролика Milana бесплатным голосом Piper «Ирина» (sherpa-onnx).
1) pip install sherpa-onnx numpy
2) скачать и распаковать голос рядом со скриптом:
   https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-irina-medium.tar.bz2
3) python make_voice.py   → voice_track.wav и строка длительностей сцен (d=...) для promo-render.js
Текст реплик — lines.json (числа писать словами, ударения проверять на слух)."""
import json, wave, numpy as np, sherpa_onnx
D = 'vits-piper-ru_RU-irina-medium/'
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=D + 'ru_RU-irina-medium.onnx', tokens=D + 'tokens.txt', data_dir=D + 'espeak-ng-data'), num_threads=4)))
LEAD, clips = 0.35, []
for key, text in json.load(open('lines.json', encoding='utf-8')):
    a = tts.generate(text, sid=0, speed=0.9)
    clips.append((key, np.array(a.samples, dtype=np.float32)))
sr = a.sample_rate
scene = [round(len(x) / sr + LEAD + (2.0 if k == 's5' else 0.55), 2) for k, x in clips]
scene[0] = max(scene[0], 2.8)
track = np.zeros(int(sum(scene) * sr), dtype=np.float32)
for (k, x), st in zip(clips, np.cumsum([0] + scene[:-1])):
    i = int((st + LEAD) * sr); track[i:i + len(x)] += x[:len(track) - i]
with wave.open('voice_track.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(track, -1, 1) * 32767).astype(np.int16).tobytes())
print('d=' + ','.join(map(str, scene)))
