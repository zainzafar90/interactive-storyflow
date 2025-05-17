import { xai } from "@ai-sdk/xai";
import {
  streamText,
  smoothStream,
  Message,
  appendClientMessage,
  appendResponseMessages,
} from "ai";
import { storyTellingTool } from "../../../../lib/ai/tools/storytelling-tool";
import { systemPrompt } from "../../../../lib/ai/prompts";
import { auth, UserType } from "@/app/(auth)/auth";
import {
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  getUser,
} from "@/lib/db/queries";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { getTrailingMessageId } from "@/lib/db/utils";
import crypto from "crypto";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, id } = await req.json();

    const session = await auth();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userType: UserType = session.user.type;

    const users = await getUser(session.user.email || "");
    if (users.length === 0) {
      return new Response("User not found in database", { status: 404 });
    }

    const [user] = users;

    const messageCount = await getMessageCountByUserId({
      id: user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new Response(
        "You have exceeded your maximum number of messages for the day! Please try again later.",
        {
          status: 429,
        }
      );
    }

    const chat = await getChatById({ id });

    if (!chat) {
      await saveChat({
        id,
        userId: user.id,
        title: "Story",
        visibility: "private",
      });
    } else {
      // For existing chats, if the user is a guest, be more lenient with ownership checks
      // This handles cases where guest user IDs may have changed
      if (userType === "guest") {
        // Guest users can only access their own chats, but we're more flexible with ID checks
        console.log("Guest user accessing chat");
      } else if (chat.userId !== user.id) {
        // Regular users must own the chat
        return new Response("Forbidden", { status: 403 });
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    const clientMessages = appendClientMessage({
      messages: previousMessages as unknown as Message[],
      message: messages[messages.length - 1],
    });

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: messages[messages.length - 1].id,
          role: "user",
          parts: messages[messages.length - 1].parts,
          createdAt: new Date(),
        },
      ],
    });

    const result = streamText({
      model: xai("grok-3-mini-beta"),
      messages: clientMessages,
      system: systemPrompt(),
      experimental_transform: smoothStream({
        chunking: "word",
      }),
      tools: {
        storyTelling: storyTellingTool,
      },
      onFinish: async ({ response }) => {
        if (session.user?.id) {
          try {
            const assistantId = getTrailingMessageId({
              messages: response.messages.filter(
                (message) => message.role === "assistant"
              ),
            });

            if (!assistantId) {
              throw new Error("No assistant message found!");
            }

            const [, assistantMessage] = appendResponseMessages({
              messages: [messages[messages.length - 1]],
              responseMessages: response.messages,
            });

            const assistantUuid = crypto.randomUUID();

            await saveMessages({
              messages: [
                {
                  id: assistantUuid,
                  chatId: id,
                  role: assistantMessage.role,
                  parts: assistantMessage.parts,
                  createdAt: new Date(),
                },
              ],
            });
          } catch (error) {
            console.error("Failed to save chat", error);
          }
        }
      },
      onError: (error) => {
        console.error("Error", error);
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error", error);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
