"use client";

import { useState, useRef, useEffect } from "react";
import { UseChatHelpers } from "@ai-sdk/react";

import { useVisualizer } from "./use-visualizer";
import { TextHighlighter } from "./text-highlighter";
import { useAudio } from "./use-audio";

interface StoryResult {
  story: string;
  choices?: string[];
  completed?: boolean;
  audioUrl?: string | null;
}

interface AudioPlayerProps {
  story: StoryResult;
  append: UseChatHelpers["append"];
  isLastMessageReadyToPlay: string;
  messageId: string;
}

export function AudioPlayer({
  story,
  append,
  isLastMessageReadyToPlay,
  messageId,
}: AudioPlayerProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [story.audioUrl]);

  const [visualizerReady, setVisualizerReady] = useState(false);
  const { isPlaying, toggle } = useAudio(audioRef.current);

  useVisualizer(audioRef, canvasRef, visualizerReady);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
  }, [story.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isLastMessageReadyToPlay === messageId && story.audioUrl) {
      audio.play().catch(() => {});
    }
  }, [isLastMessageReadyToPlay, messageId, story.audioUrl]);

  const handleSaveAudio = () => {
    if (story.audioUrl) {
      const link = document.createElement("a");
      link.href = story.audioUrl;
      link.target = "_blank";
      link.download = `${story.audioUrl}`;
      link.click();
    }
  };

  const handleChoiceSelection = (choice: string, index: number) => {
    setSelectedChoice(index);
    append({
      role: "user",
      content: choice,
    });
  };

  return (
    <div className="relative rounded-xl border border-border bg-background/70 pb-4">
      <div className="flex rounded-t-xl border-b border-border">
        <div className="flex">
          <button
            className={`h-12 px-6 border-r font-semibold transition-colors first:rounded-tl-xl ${
              story.completed
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
            }`}
          >
            {story.completed ? (
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Completed
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5 text-orange-800 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                In Progress
              </span>
            )}
          </button>
          <button className="h-12 px-6 border-r text-sm transition-colors first:rounded-tl-xl text-muted-foreground">
            <div>Words: {story?.story?.split(" ").length}</div>
          </button>
        </div>
        <button
          className="group flex items-center h-12 ml-auto px-6 font-semibold transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
          onClick={handleSaveAudio}
          disabled={!story.audioUrl}
        >
          <svg
            className="inline-flex w-4 h-4 mr-2 transition-colors fill-muted-foreground lg:mr-0 md:mr-2"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M17.493 11.66c.46 0 .833.373.833.833v1.034l-.037 1.675c-.038.468-.12.899-.326 1.303-.32.627-.829 1.137-1.457 1.457-.404.206-.835.288-1.303.326a18.37 18.37 0 0 1-1.395.037H6.459c-.671 0-1.224 0-1.675-.037-.468-.038-.899-.12-1.303-.326-.627-.32-1.137-.829-1.457-1.457-.206-.404-.288-.835-.326-1.303l-.036-1.129-.001-1.581c0-.46.373-.833.833-.833s.833.373.833.833v1l.031 1.574c.03.365.084.552.15.683.16.314.415.569.728.728.13.066.317.12.683.15a14.55 14.55 0 0 0 1.08.031h7.989l1.08-.031c.365-.03.552-.084.682-.15.314-.16.569-.415.728-.728.066-.13.12-.317.15-.683.031-.375.031-.86.031-1.574v-1c0-.46.373-.833.833-.833zm-7.5-10c.46 0 .833.373.833.833h0v7.988l2.744-2.744c.325-.325.853-.325 1.178 0s.325.853 0 1.179h0l-4.167 4.167c-.325.325-.853.325-1.179 0h0L5.237 8.916c-.325-.325-.325-.853 0-1.179s.853-.325 1.179 0h0l2.744 2.744V2.493c0-.46.373-.833.833-.833z" />
          </svg>
          <span className="lg:block hidden ml-2">Save Audio</span>
        </button>
      </div>

      <div className="flex items-center px-6 py-5">
        <button
          className={`group shrink-0 w-10 h-10 mr-3 rounded-full bg-foreground text-background cursor-pointer ${
            !story.audioUrl ? "opacity-50" : ""
          }`}
          onClick={toggle}
          disabled={!story.audioUrl}
        >
          {isPlaying ? (
            <svg
              className="inline-flex transition-colors w-6 h-6 -mt-1"
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path
                d="M5.417 5H8.75v10H5.417V5zm5.833 0h3.333v10H11.25V5z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg
              className="inline-flex transition-colors w-4 h-4 -mt-1"
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path
                d="M6.589 2.336l.03.02 8.791 5.86.671.473c.189.152.412.364.54.673.169.409.169.868 0 1.277-.128.309-.351.521-.54.673-.181.146-.417.303-.671.473l-8.821 5.88-.828.522c-.237.129-.563.276-.944.253-.486-.029-.936-.27-1.23-.658-.23-.304-.288-.656-.313-.925s-.025-.605-.025-.978V4.159v-.036l.025-.978c.025-.269.083-.622.313-.925.294-.389.743-.629 1.23-.658.38-.023.706.124.944.253s.517.315.828.522z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>

        <div className="flex items-center justify-center w-full grow text-center relative h-10">
          {!story.audioUrl ? (
            <div className="text-sm text-muted-foreground italic">
              Audio generation unavailable
            </div>
          ) : (
            <canvas ref={canvasRef} className="w-full h-16"></canvas>
          )}
        </div>
      </div>

      <div className="px-6">
        <TextHighlighter
          text={story.story}
          currentTime={currentTime}
          duration={duration}
        />
      </div>

      <audio
        key={story.audioUrl}
        ref={audioRef}
        src={story.audioUrl || undefined}
        onPlay={() => setVisualizerReady(true)}
        preload="metadata"
        className="hidden"
        crossOrigin="anonymous"
      />

      {story.choices && story.choices.length > 0 && !story.completed && (
        <div className="px-6 pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Choose your next step:
          </h3>
          <div className="space-y-2">
            {story.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoiceSelection(choice, index)}
                className={`w-full text-left px-4 py-3 rounded-lg border border-border 
                  bg-background hover:bg-muted/50 transition-colors text-foreground
                  flex items-center justify-between
                  ${selectedChoice === index ? "ring-1 ring-primary" : ""}`}
              >
                <span>{choice}</span>
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {story.completed && (
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <svg
              className="w-6 h-6 mr-3 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-300">
                Good one right?
              </h4>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Like all good things, this one must come to an end. But you can
                always ask for a new one.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
