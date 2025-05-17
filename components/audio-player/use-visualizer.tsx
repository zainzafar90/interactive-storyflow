import { useEffect, useRef } from "react";

export function useVisualizer(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  enabled: boolean = true
) {
  const lastAudioEl = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (lastAudioEl.current === audioEl) return;
    lastAudioEl.current = audioEl;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let rafId: number;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const c = canvas.getContext("2d");
      if (!c) return;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      analyser.getByteFrequencyData(data);
      c.clearRect(0, 0, width, height);

      const bars = 80;
      const w = width / bars;
      for (let i = 0; i < bars; i++) {
        const v = data[i];
        const h = Math.max(3, (v / 255) * height * 0.6);
        const x = i * w;
        const y = height / 2 - h / 2;
        c.fillStyle = `hsla(${260 - (i / bars) * 60},${70 + (v / 255) * 30}%,${
          60 + (v / 255) * 20
        }%,${0.7 + (v / 255) * 0.3})`;
        c.beginPath();
        c.roundRect(x, y, w * 0.8, h, [w * 0.4]);
        c.fill();
      }
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafId);
      ctx.close();
      lastAudioEl.current = null;
    };
  }, [audioRef, canvasRef, enabled]);
}
