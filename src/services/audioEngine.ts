/**
 * Web Audio Engine for Sonora
 * Provides real audio synthesis (chords, bass, drum rhythm) when playing virtual tracks,
 * and seamlessly handles real HTML5 Audio files (Blob URLs / uploaded MP3s).
 */

class SonoraAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private currentTrackId: string | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private step: number = 0;
  private bpm: number = 105;
  private volume: number = 0.8;
  private nativeAudio: HTMLAudioElement | null = null;
  private isUsingNativeAudio: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    if (this.nativeAudio) {
      this.nativeAudio.volume = this.volume;
    }
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(16);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public playTrack(trackId: string, mediaUrl: string, bpm: number = 100, onTimeUpdate?: (sec: number) => void) {
    this.initContext();
    this.stop();
    this.isPlaying = true;
    this.currentTrackId = trackId;
    this.bpm = bpm;

    // If mediaUrl is a real playable URL (starts with blob: or http with mp3/wav extension), try native audio
    if (mediaUrl.startsWith('blob:') || (mediaUrl.startsWith('http') && (mediaUrl.endsWith('.mp3') || mediaUrl.endsWith('.wav')))) {
      try {
        this.isUsingNativeAudio = true;
        this.nativeAudio = new Audio(mediaUrl);
        this.nativeAudio.volume = this.volume;
        this.nativeAudio.play().catch(() => {
          // fallback to synthesized music
          this.playSynthesizedStream(onTimeUpdate);
        });
        if (onTimeUpdate) {
          this.nativeAudio.ontimeupdate = () => {
            if (this.nativeAudio) {
              onTimeUpdate(this.nativeAudio.currentTime);
            }
          };
        }
        return;
      } catch (e) {
        console.warn('Native audio failed, falling back to procedural synthesizer', e);
      }
    }

    // Default: Lush synthesized procedural lo-fi / synth track
    this.isUsingNativeAudio = false;
    this.playSynthesizedStream(onTimeUpdate);
  }

  private playSynthesizedStream(onTimeUpdate?: (sec: number) => void) {
    let elapsed = 0;
    const intervalMs = (60 / this.bpm / 4) * 1000; // 16th note step
    this.step = 0;

    // Chord progressions for chill lo-fi / synth vibe
    // Frequencies (Hz)
    const chordFrequencies = [
      [220, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    const bassNotes = [110, 87.31, 130.81, 98.0];

    const tick = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      
      const bar = Math.floor(this.step / 16) % 4;
      const stepInBar = this.step % 16;
      const now = this.ctx.currentTime;

      // Play bass on step 0, 6, 10
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
        this.triggerTone(bassNotes[bar], 'triangle', 0.4, 0.25, now);
      }

      // Play soft warm chord on downbeats
      if (stepInBar === 0 || stepInBar === 8) {
        const chord = chordFrequencies[bar];
        chord.forEach((freq) => {
          this.triggerTone(freq, 'sine', 0.8, 0.08, now);
        });
      }

      // Play soft hi-hat on every odd 16th
      if (stepInBar % 2 === 0) {
        this.triggerNoise(0.04, stepInBar === 4 || stepInBar === 12 ? 0.08 : 0.03, now);
      }

      // Soft snare/clap on 4 and 12
      if (stepInBar === 4 || stepInBar === 12) {
        this.triggerTone(180, 'sine', 0.1, 0.15, now);
        this.triggerNoise(0.12, 0.06, now);
      }

      // Gentle melodic arpeggio on steps 2, 5, 8, 11, 14
      if ([2, 5, 8, 11, 14].includes(stepInBar)) {
        const chord = chordFrequencies[bar];
        const note = chord[(stepInBar + bar) % chord.length] * 2;
        this.triggerTone(note, 'sine', 0.2, 0.06, now);
      }

      this.step++;
      elapsed += intervalMs / 1000;
      if (onTimeUpdate && this.step % 4 === 0) {
        onTimeUpdate(elapsed);
      }

      this.timerId = window.setTimeout(tick, intervalMs);
    };

    tick();
  }

  private triggerTone(freq: number, type: OscillatorType, dur: number, gainVal: number, time: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + dur);
    } catch {
      // ignore audio clock glitches
    }
  }

  private triggerNoise(dur: number, gainVal: number, time: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * dur;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 4000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(time);
    } catch {
      // ignore
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.nativeAudio) {
      this.nativeAudio.pause();
    }
  }

  public resume(onTimeUpdate?: (sec: number) => void) {
    if (this.isUsingNativeAudio && this.nativeAudio) {
      this.isPlaying = true;
      this.nativeAudio.play().catch(() => {});
    } else if (this.currentTrackId) {
      this.isPlaying = true;
      this.playSynthesizedStream(onTimeUpdate);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.nativeAudio) {
      this.nativeAudio.pause();
      this.nativeAudio.currentTime = 0;
      this.nativeAudio = null;
    }
  }

  public seek(seconds: number) {
    if (this.isUsingNativeAudio && this.nativeAudio) {
      this.nativeAudio.currentTime = seconds;
    }
  }

  public playAdJingle() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    // Energetic chime jingle for ad start
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      this.triggerTone(freq, 'sine', 0.25, 0.12, now + idx * 0.1);
    });
  }
}

export const audioEngine = new SonoraAudioEngine();
