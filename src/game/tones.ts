let audio: AudioContext | null = null;

export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!audio) audio = new AudioContext();
  if (audio.state === "suspended") void audio.resume();
}

function beep(freq: number, at: number, dur: number, type: OscillatorType, gain: number) {
  if (!audio) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, at);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

export function playCue(kind: "catch" | "gold" | "miss" | "over", muted: boolean) {
  if (muted || !audio) return;
  const t = audio.currentTime;
  const wobble = 0.94 + Math.random() * 0.12;
  if (kind === "catch") {
    beep(520 * wobble, t, 0.08, "triangle", 0.06);
    beep(780 * wobble, t + 0.05, 0.1, "sine", 0.05);
  } else if (kind === "gold") {
    beep(660 * wobble, t, 0.08, "triangle", 0.07);
    beep(880 * wobble, t + 0.06, 0.1, "sine", 0.06);
    beep(1170 * wobble, t + 0.12, 0.14, "sine", 0.05);
  } else if (kind === "miss") {
    beep(140, t, 0.16, "sine", 0.07);
    beep(90, t + 0.04, 0.18, "triangle", 0.05);
  } else {
    beep(440, t, 0.12, "triangle", 0.06);
    beep(330, t + 0.1, 0.14, "triangle", 0.05);
    beep(220, t + 0.22, 0.22, "sine", 0.05);
  }
}
