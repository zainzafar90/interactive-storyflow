import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import type { UIMessage } from "ai";
import { Chat } from "@/components/chat/chat";
import { Header } from "@/components/header";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  if (chat.visibility === "private") {
    if (!session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage["parts"],
      role: message.role as UIMessage["role"],
      content: "",
      createdAt: message.createdAt,
    }));
  }

  return (
    <div className="flex flex-col h-full px-4">
      <Header chatId={chat.id} />
      <Chat
        chatId={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        // isReadonly={session?.user?.id !== chat.userId}
      />
    </div>
  );
}
