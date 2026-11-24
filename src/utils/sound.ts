let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  delay = 0,
  volume = 0.08,
  type: OscillatorType = 'sine'
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.03);
}

export function playStartChime(enabled: boolean) {
  if (!enabled) return;
  playTone(523.25, 0.22, 0, 0.07, 'sine'); // C5
  playTone(659.25, 0.28, 0.08, 0.06, 'sine'); // E5
}

export function playStopChime(enabled: boolean) {
  if (!enabled) return;
  playTone(659.25, 0.2, 0, 0.06, 'sine');
  playTone(523.25, 0.3, 0.09, 0.06, 'sine');
}

export function playBuildChime(enabled: boolean) {
  if (!enabled) return;
  playTone(587.33, 0.2, 0, 0.07, 'triangle'); // D5
  playTone(783.99, 0.24, 0.08, 0.07, 'triangle'); // G5
  playTone(987.77, 0.36, 0.16, 0.06, 'sine'); // B5
}

export function playLevelUnlockChime(enabled: boolean) {
  if (!enabled) return;
  playTone(523.25, 0.22, 0, 0.07, 'sine');
  playTone(659.25, 0.22, 0.09, 0.07, 'sine');
  playTone(783.99, 0.24, 0.18, 0.07, 'sine');
  playTone(1046.5, 0.45, 0.27, 0.08, 'sine');
}
