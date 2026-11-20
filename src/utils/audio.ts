// Web Audio API synthesizer for instant pleasant feedback sounds without external audio assets

let currentAudio: HTMLAudioElement | null = null;

export function playTakePillChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // Pleasant ascending tri-tone chord (C5 - E5 - G5)
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  } catch (err) {
    console.warn("Audio chime failed:", err);
  }
}

export function playReminderBell() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Gentle dual-tone alert chime (A4 - C#5)
    const tones = [440, 554.37];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.15 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.65);
    });
  } catch (err) {
    console.warn("Reminder bell failed:", err);
  }
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speakText(
  text: string,
  speechCode: string,
  rate: number = 0.85,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  stopSpeaking();

  if (!text) return;

  // Try server-side Gemini TTS first
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: "Kore" }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audioBase64) {
        const audioSrc = `data:${data.format || "audio/wav"};base64,${data.audioBase64}`;
        const audio = new Audio(audioSrc);
        currentAudio = audio;
        audio.playbackRate = rate;
        audio.onended = () => {
          currentAudio = null;
          onEnd?.();
        };
        audio.onerror = (e) => {
          console.warn("Audio element error, falling back to Web Speech:", e);
          fallbackWebSpeech(text, speechCode, rate, onEnd, onError);
        };
        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.log("Server TTS not available or errored, falling back to Web Speech API:", err);
  }

  // Fallback to browser Web Speech API
  fallbackWebSpeech(text, speechCode, rate, onEnd, onError);
}

function fallbackWebSpeech(
  text: string,
  speechCode: string,
  rate: number = 0.85,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported in this browser.");
    onError?.(new Error("Speech synthesis not supported"));
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechCode || "en-US";
  utterance.rate = rate; // Slower rate for elderly comprehension
  utterance.pitch = 1.0;

  // Attempt to select a voice matching language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(speechCode.toLowerCase().slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis error:", e);
    onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
}
