import Image from "next/image";
import { AILogo } from "../ai-logo";
import { AudioPlayer } from "../audio-player/audio-player";
import { Message, UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";

interface StoryResult {
  story: string;
  choices?: string[];
  completed?: boolean;
  audioUrl?: string | null;
}

interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  state: string;
  args?: Record<string, unknown>;
  result?: StoryResult | Record<string, unknown>;
}

interface ToolInvocationPart {
  type: string;
  toolInvocation: ToolInvocation;
}

export const UserMessage = ({ message }: { message: Message }) => (
  <div className="flex p-8 border-b md:px-5">
    <div className="relative shrink-0 w-8 h-8">
      <Image
        src="/profile.svg"
        alt="logo"
        width={40}
        height={40}
        className="rounded-full"
      />
    </div>
    <div className="w-[calc(100%-2rem)] pl-6 space-y-6 md:pl-4">
      <div className="pt-1 text-body-2">
        {message.parts?.map((part, i: number) => {
          switch (part.type) {
            case "text":
              return <div key={`${message.id}-${i}`}>{part.text}</div>;
            case "tool-invocation":
              return (
                <pre key={`${message.id}-${i}`} className="mt-2 p-2 rounded">
                  {JSON.stringify(part.toolInvocation, null, 2)}
                </pre>
              );
          }
        })}
      </div>
    </div>
  </div>
);

export const AssistantMessage = ({
  message,
  append,
  status,
  isLastMessageReadyToPlay,
}: {
  message: Message;
  append: UseChatHelpers["append"];
  status: UseChatHelpers["status"];
  isLastMessageReadyToPlay: string;
}) => (
  <div className="flex flex-col space-y-4 p-8 border-b md:px-5">
    <div className="flex">
      <AILogo className="p-1 size-8 rounded-full bg-foreground text-background" />
      <div className="w-[calc(100%-2rem)] pl-6 space-y-6 md:pl-4">
        <div className="pt-1">
          {status === "streaming" && message.parts?.length === 1 && (
            <div className="flex w-full items-center gap-2 animate-pulse">
              Cooking up a story...
            </div>
          )}

          {message.parts?.map((part, i: number) => {
            switch (part.type) {
              case "text":
                return (
                  <div key={`${message.id}-${i}`} className="my-2">
                    {part.text}
                  </div>
                );
              case "tool-invocation":
                return (
                  <ToolInvocationPart
                    key={`${message.id}-${i}`}
                    part={part as ToolInvocationPart}
                    append={append}
                    isLastMessageReadyToPlay={isLastMessageReadyToPlay}
                    messageId={message.id}
                  />
                );
            }
          })}
        </div>
      </div>
    </div>
  </div>
);

export const ToolInvocationPart = ({
  part,
  append,
  isLastMessageReadyToPlay,
  messageId,
}: {
  part: ToolInvocationPart;
  append: UseChatHelpers["append"];
  isLastMessageReadyToPlay: string;
  messageId: string;
}) => {
  const { toolInvocation } = part;
  const { state } = toolInvocation;

  if (state === "call") {
    return <ToolCall toolInvocation={toolInvocation} />;
  }

  if (state === "result") {
    return (
      <ToolResult
        toolInvocation={toolInvocation}
        append={append}
        isLastMessageReadyToPlay={isLastMessageReadyToPlay}
        messageId={messageId}
      />
    );
  }

  return (
    <pre className="mt-2 p-2 rounded">
      {JSON.stringify(toolInvocation, null, 2)}
    </pre>
  );
};

export const ToolCall = ({
  toolInvocation,
}: {
  toolInvocation: ToolInvocation;
}) => {
  const { toolName, toolCallId, args } = toolInvocation;

  if (toolName === "storyTelling" && args) {
    return (
      <div
        key={toolCallId}
        className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-purple-800 dark:text-purple-300 font-medium flex items-center">
            <svg
              className="size-4 text-purple-600 dark:text-purple-400 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            Processing story for audio narration...
          </span>
        </div>
        <div className="animate-pulse">
          <p className="mt-1 text-sm text-purple-700 dark:text-purple-400">
            {args.story as string}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-blue-800 dark:text-blue-300 font-medium flex items-center">
          <svg
            className="size-4 text-blue-600 dark:text-blue-400 mr-1"
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
          Processing {toolName} request...
        </span>
      </div>
      <pre className="text-sm overflow-auto">
        {JSON.stringify(args, null, 2)}
      </pre>
    </div>
  );
};

export const ToolResult = ({
  toolInvocation,
  append,
  isLastMessageReadyToPlay,
  messageId,
}: {
  toolInvocation: ToolInvocation;
  append: UseChatHelpers["append"];
  isLastMessageReadyToPlay: string;
  messageId: string;
}) => {
  const { toolName, toolCallId, result } = toolInvocation;

  if (toolName === "storyTelling" && result) {
    return (
      <AudioPlayer
        key={toolCallId}
        append={append}
        story={result as StoryResult}
        isLastMessageReadyToPlay={isLastMessageReadyToPlay}
        messageId={messageId}
      />
    );
  }

  return (
    <div
      key={toolCallId}
      className="p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-800 dark:text-green-300 font-medium flex items-center">
          <svg
            className="size-4 text-green-600 dark:text-green-400 mr-1"
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
          {toolName} result received
        </span>
      </div>
      <pre className="text-sm overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};

export const ThinkingMessage = () => {
  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="flex flex-col space-y-4 p-8 border-b md:px-5"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
      data-role="assistant"
    >
      <div className="flex items-center gap-4 animate-pulse">
        <AILogo className="p-1 flex-shrink-0 size-8 rounded-full bg-foreground text-background" />
        <div className="text-muted-foreground">Thinking...</div>
      </div>
    </motion.div>
  );
};

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl h-32 mx-auto p-8 border-b md:px-5 size-full flex flex-row items-center mt-6 gap-4"
    >
      <AILogo className="p-1 size-8 rounded-full bg-foreground text-background" />

      <div className="flex flex-col gap-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0 }}
          className="text-sm font-semibold"
        >
          Let&apos;s create a story together!
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5 }}
          className="text-foreground/80"
        >
          Example, generate a story about a young girl who discovers a hidden
          world.
        </motion.div>
      </div>
    </div>
  );
};
