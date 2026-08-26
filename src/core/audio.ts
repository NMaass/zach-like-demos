type SoundName = 'place' | 'rotate' | 'remove' | 'run' | 'success' | 'error' | 'paper' | 'rope';

let audioContext: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  audioContext ??= new AudioContext();
  return audioContext;
}

interface Tone {
  frequency: number;
  duration: number;
  gain: number;
  type: OscillatorType;
  delay?: number;
}

const soundMap: Record<SoundName, Tone[]> = {
  place: [{ frequency: 190, duration: 0.045, gain: 0.035, type: 'triangle' }],
  rotate: [{ frequency: 280, duration: 0.06, gain: 0.025, type: 'sine' }],
  remove: [{ frequency: 120, duration: 0.07, gain: 0.03, type: 'triangle' }],
  run: [
    { frequency: 160, duration: 0.05, gain: 0.03, type: 'square' },
    { frequency: 240, duration: 0.06, gain: 0.025, type: 'square', delay: 0.07 },
  ],
  success: [
    { frequency: 392, duration: 0.12, gain: 0.04, type: 'sine' },
    { frequency: 523.25, duration: 0.18, gain: 0.04, type: 'sine', delay: 0.11 },
    { frequency: 659.25, duration: 0.24, gain: 0.035, type: 'sine', delay: 0.23 },
  ],
  error: [
    { frequency: 150, duration: 0.12, gain: 0.035, type: 'sawtooth' },
    { frequency: 118, duration: 0.16, gain: 0.03, type: 'sawtooth', delay: 0.09 },
  ],
  paper: [
    { frequency: 760, duration: 0.035, gain: 0.016, type: 'triangle' },
    { frequency: 520, duration: 0.05, gain: 0.012, type: 'triangle', delay: 0.025 },
  ],
  rope: [
    { frequency: 90, duration: 0.05, gain: 0.022, type: 'sine' },
    { frequency: 135, duration: 0.06, gain: 0.018, type: 'triangle', delay: 0.035 },
  ],
};

export function playSound(name: SoundName, enabled: boolean): void {
  if (!enabled) return;
  const ctx = context();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const now = ctx.currentTime;
  for (const tone of soundMap[name]) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + (tone.delay ?? 0);
    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone.gain, start + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + tone.duration + 0.02);
  }
}
