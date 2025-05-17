import { useCallback, useEffect, useState } from "react";

export function useAudio(audioEl: HTMLAudioElement | null) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioEl) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audioEl.addEventListener("play", handlePlay);
    audioEl.addEventListener("pause", handlePause);

    setIsPlaying(!audioEl.paused);

    return () => {
      audioEl.removeEventListener("play", handlePlay);
      audioEl.removeEventListener("pause", handlePause);
    };
  }, [audioEl]);

  const play = useCallback(() => {
    if (audioEl) audioEl.play();
  }, [audioEl]);

  const pause = useCallback(() => {
    if (audioEl) audioEl.pause();
  }, [audioEl]);

  const toggle = useCallback(() => {
    if (!audioEl) return;
    if (audioEl.paused) {
      audioEl.play();
    } else {
      audioEl.pause();
    }
  }, [audioEl]);

  return { isPlaying, play, pause, toggle };
}
