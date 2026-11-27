// Synthesized Web Audio API sound effects for responsive 2D game feedback

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined' || isMuted) return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean): void {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
  delay = 0
): void {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playStep(): void {
  playTone(280, 0.06, 'triangle', 0.07);
}

export function playPickup(): void {
  playTone(523.25, 0.1, 'sine', 0.12, 0);
  playTone(659.25, 0.14, 'sine', 0.12, 0.07);
}

export function playBump(): void {
  playTone(190, 0.12, 'sawtooth', 0.08, 0);
  playTone(145, 0.18, 'triangle', 0.09, 0.08);
}

export function playSuccess(): void {
  playTone(523.25, 0.12, 'triangle', 0.14, 0);
  playTone(659.25, 0.12, 'triangle', 0.14, 0.09);
  playTone(783.99, 0.16, 'triangle', 0.14, 0.18);
  playTone(1046.5, 0.28, 'sine', 0.15, 0.28);
}

export function playError(): void {
  playTone(310, 0.15, 'triangle', 0.11, 0);
  playTone(230, 0.22, 'triangle', 0.11, 0.12);
}

export function speakIndonesian(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || isMuted) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'id-ID';
    utter.rate = 0.92;
    utter.pitch = 1.05;
    window.speechSynthesis.speak(utter);
  } catch {
    // Ignore speech synthesis errors on unsupported browsers
  }
}
