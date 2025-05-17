import { Button } from "@/components/ui/button";
import { AILogo } from "@/components/ai-logo";
import { ChangeEvent } from "react";
import { UseChatHelpers } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
interface ChatInputProps {
  chatId: string;
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: UseChatHelpers["handleSubmit"];
  status: UseChatHelpers["status"];
}

export const ChatInput = ({
  chatId,
  input,
  handleInputChange,
  handleSubmit,
  status,
}: ChatInputProps) => {
  const submitForm = () => {
    window.history.replaceState({}, "", `/chat/${chatId}`);
    handleSubmit(undefined);
  };
  return (
    <div className="w-full p-4 flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 overflow-hidden rounded-xl max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <input
          type="text"
          placeholder="Ask me anything"
          className="w-full bg-neutral-100 dark:bg-neutral-800 border border-input rounded-lg py-4 px-4 focus:outline-none focus:ring-1 focus:ring-ring"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();

              if (status !== "ready") {
                toast({
                  type: "error",
                  description:
                    "Please wait for the model to finish its response!",
                });
              } else {
                submitForm();
              }
            }
          }}
        />

        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          disabled={status === "streaming" || status === "submitted"}
        >
          <AILogo
            className={cn(
              "p-1 size-7 rounded-md bg-foreground text-background",
              (status === "streaming" || status === "submitted") &&
                "animate-pulse"
            )}
          />
        </Button>
      </form>
    </div>
  );
};
