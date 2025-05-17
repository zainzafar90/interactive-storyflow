"use client";

import { useChat } from "@ai-sdk/react";
import { ChatMessages } from "./chat-messages";
import { toast } from "@/components/ui/toast";
import { UIMessage } from "ai";
import { useState } from "react";

export const Chat = ({
  chatId,
  initialMessages,
}: {
  chatId: string;
  initialMessages: Array<UIMessage>;
}) => {
  const [isLastMessageReadyToPlay, setIsLastMessageReadyToPlay] = useState("");
  const { messages, input, status, handleInputChange, handleSubmit, append } =
    useChat({
      id: chatId,
      initialMessages,
      onFinish: (message) => {
        setIsLastMessageReadyToPlay(message.id);
      },
      onError: (error) => {
        toast({
          type: "error",
          description: error.message,
        });
      },
    });

  return (
    <div className="flex flex-col w-full mx-auto max-w-2xl rounded-xl shadow-2xl z-10 -mt-20 mb-20 bg-background/50">
      <div className="relative bg-neutral-100 dark:bg-neutral-800 flex-1 rounded-b-xl">
        <ChatMessages
          input={input}
          status={status}
          chatId={chatId}
          append={append}
          messages={messages}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          isLastMessageReadyToPlay={isLastMessageReadyToPlay}
        />
      </div>
    </div>
  );
};
