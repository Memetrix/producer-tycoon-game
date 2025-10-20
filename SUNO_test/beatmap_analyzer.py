#!/usr/bin/env python3
"""
Анализирует музыкальный трек и создаёт beatmap с реальными ритмическими моментами
"""
import librosa
import numpy as np
import json
import sys

def analyze_track(audio_file):
    """Анализирует трек и находит все ритмические моменты"""
    print(f"🎵 Загружаем: {audio_file}")
    
    # Загружаем аудио
    y, sr = librosa.load(audio_file, sr=44100)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"⏱️  Длительность: {duration:.2f}s")
    
    # 1. Определяем BPM (темп)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
    tempo = float(np.mean(tempo)) if isinstance(tempo, np.ndarray) else float(tempo)
    print(f"🎼 BPM: {tempo:.1f}")
    print(f"🥁 Найдено beats: {len(beats)}")
    
    # 2. Onset detection - находим все атаки/удары
    # Используем разные методы для разных типов событий
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    
    # Strong onsets (основные удары - kick, snare)
    onsets_strong = librosa.onset.onset_detect(
        onset_envelope=onset_env,
        sr=sr,
        units='time',
        backtrack=True,
        pre_max=20,
        post_max=20,
        pre_avg=100,
        post_avg=100,
        delta=0.2,
        wait=10
    )
    
    # Weak onsets (hi-hats, перкуссия)
    onsets_weak = librosa.onset.onset_detect(
        onset_envelope=onset_env,
        sr=sr,
        units='time',
        backtrack=True,
        pre_max=10,
        post_max=10,
        pre_avg=50,
        post_avg=50,
        delta=0.1,
        wait=5
    )
    
    print(f"💥 Strong onsets: {len(onsets_strong)}")
    print(f"✨ Weak onsets: {len(onsets_weak)}")
    
    # 3. Спектральный анализ для определения типов ударов
    # Низкие частоты = kick, средние = snare, высокие = hi-hat
    S = np.abs(librosa.stft(y))
    
    def classify_onset(time_sec):
        """Классифицирует тип удара по частотному спектру"""
        frame = librosa.time_to_frames(time_sec, sr=sr)
        if frame >= S.shape[1]:
            frame = S.shape[1] - 1
            
        spectrum = S[:, frame]
        
        # Делим спектр на частотные диапазоны
        low = np.mean(spectrum[0:50])      # Kick (низкие)
        mid = np.mean(spectrum[50:150])    # Snare (средние)
        high = np.mean(spectrum[150:300])  # Hi-hat (высокие)
        
        total = low + mid + high
        if total == 0:
            return 'note'
            
        # Определяем доминирующую частоту
        if low > mid * 1.5 and low > high * 1.5:
            return 'kick'
        elif mid > low * 1.2 and mid > high * 1.2:
            return 'snare'
        elif high > low * 1.2 and high > mid * 1.2:
            return 'hihat'
        else:
            return 'note'
    
    # 4. Создаём beatmap
    beatmap = {
        'metadata': {
            'title': 'Infernal Pulse',
            'artist': 'Suno AI',
            'duration': duration,
            'bpm': float(tempo)
        },
        'timing': {
            'beats': beats.tolist(),  # Основная метрическая сетка
        },
        'notes': []
    }
    
    # Добавляем сильные удары (основной трек)
    for onset_time in onsets_strong:
        note_type = classify_onset(onset_time)
        beatmap['notes'].append({
            'time': float(onset_time),
            'type': note_type,
            'strength': 'strong'
        })
    
    # Добавляем слабые удары (для сложности)
    for onset_time in onsets_weak:
        # Проверяем что не дублируем сильный удар
        if not any(abs(n['time'] - onset_time) < 0.05 for n in beatmap['notes']):
            note_type = classify_onset(onset_time)
            beatmap['notes'].append({
                'time': float(onset_time),
                'type': note_type,
                'strength': 'weak'
            })
    
    # Сортируем по времени
    beatmap['notes'].sort(key=lambda x: x['time'])
    
    print(f"\n📝 Создано нот: {len(beatmap['notes'])}")
    print(f"📊 Средняя плотность: {len(beatmap['notes'])/duration:.1f} нот/сек")
    
    return beatmap

def create_osu_beatmap(beatmap, output_file):
    """Создаёт .osu файл для игры"""
    osu_content = f"""osu file format v14

[General]
AudioFilename: audio.mp3
Mode: 0

[Metadata]
Title:{beatmap['metadata']['title']}
Artist:{beatmap['metadata']['artist']}

[Difficulty]
HPDrainRate:5
CircleSize:4
OverallDifficulty:7
ApproachRate:8
SliderMultiplier:1.4
SliderTickRate:1

[TimingPoints]
0,{60000/beatmap['metadata']['bpm']:.2f},4,2,0,50,1,0

[HitObjects]
"""
    
    # Добавляем ноты
    for note in beatmap['notes']:
        time_ms = int(note['time'] * 1000)
        # Позиция зависит от типа
        positions = {
            'kick': (256, 192),    # Центр
            'snare': (128, 192),   # Слева
            'hihat': (384, 192),   # Справа
            'note': (256, 192)     # Центр
        }
        x, y = positions.get(note['type'], (256, 192))
        
        # type,combo (1=circle, 5=new combo)
        hit_type = 1 if note['strength'] == 'weak' else 5
        osu_content += f"{x},{y},{time_ms},{hit_type},0,0:0:0:0:\n"
    
    with open(output_file, 'w') as f:
        f.write(osu_content)
    
    print(f"✅ Создан OSU beatmap: {output_file}")

def create_simplified_beatmap(beatmap, difficulty='normal'):
    """Создаёт упрощённую версию для разных уровней сложности"""
    notes = beatmap['notes'].copy()
    
    if difficulty == 'easy':
        # Только сильные удары, kick и snare
        notes = [n for n in notes if n['strength'] == 'strong' and n['type'] in ['kick', 'snare']]
    elif difficulty == 'normal':
        # Сильные удары + некоторые слабые
        strong_notes = [n for n in notes if n['strength'] == 'strong']
        weak_notes = [n for n in notes if n['strength'] == 'weak']
        # Берём каждый второй слабый удар
        weak_notes = weak_notes[::2]
        notes = strong_notes + weak_notes
        notes.sort(key=lambda x: x['time'])
    # hard = все ноты
    
    simplified = beatmap.copy()
    simplified['notes'] = notes
    simplified['metadata']['difficulty'] = difficulty
    
    return simplified

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python beatmap_analyzer.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    
    # Анализируем
    beatmap = analyze_track(audio_file)
    
    # Сохраняем JSON
    json_file = '/home/claude/beatmap_full.json'
    with open(json_file, 'w') as f:
        json.dump(beatmap, f, indent=2)
    print(f"💾 Сохранён JSON: {json_file}")
    
    # Создаём OSU файл
    osu_file = '/home/claude/beatmap.osu'
    create_osu_beatmap(beatmap, osu_file)
    
    # Создаём упрощённые версии
    for difficulty in ['easy', 'normal', 'hard']:
        simplified = create_simplified_beatmap(beatmap, difficulty)
        diff_file = f'/home/claude/beatmap_{difficulty}.json'
        with open(diff_file, 'w') as f:
            json.dump(simplified, f, indent=2)
        print(f"💾 {difficulty.upper()}: {len(simplified['notes'])} нот")
