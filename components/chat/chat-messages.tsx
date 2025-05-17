"use client";

import { Message, UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { useMessages } from "@/hooks/use-messages";
import {
  Greeting,
  UserMessage,
  AssistantMessage,
  ThinkingMessage,
} from "./message-types";
import { ChangeEvent, useEffect } from "react";
import { ChatInput } from "./chat-input";

interface ChatMessagesProps {
  chatId: string;
  messages: Message[];
  isLastMessageReadyToPlay: string;
  status: UseChatHelpers["status"];
  append: UseChatHelpers["append"];
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: UseChatHelpers["handleSubmit"];
}

export const ChatMessages = ({
  chatId,
  messages,
  isLastMessageReadyToPlay,
  status,
  append,
  input,
  handleInputChange,
  handleSubmit,
}: ChatMessagesProps) => {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    scrollToBottom,
  } = useMessages({
    chatId: "chat-messages",
    status,
  });

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages, scrollToBottom]);

  return (
    <div
      ref={messagesContainerRef}
      id="chat-messages"
      className="h-auto overflow-y-auto"
    >
      {messages.length === 0 && <Greeting />}

      {messages.map((message) => {
        if (message.role === "user") {
          return <UserMessage key={message.id} message={message} />;
        } else if (message.role === "assistant") {
          return (
            <AssistantMessage
              key={message.id}
              append={append}
              status={status}
              message={message}
              isLastMessageReadyToPlay={isLastMessageReadyToPlay}
            />
          );
        }
      })}

      {(status === "submitted" || status === "streaming") &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-2 min-h-0.5"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />

      <ChatInput
        status={status}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        chatId={chatId}
      />
    </div>
  );
};
