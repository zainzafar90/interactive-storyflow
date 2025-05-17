import { Header } from "@/components/header";
import { Chat } from "@/components/chat/chat";
import { redirect } from "next/navigation";
import { generateUUID } from "@/lib/db/utils";
import { auth } from "../(auth)/auth";
export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const id = generateUUID();

  return (
    <div className="flex flex-col h-full px-4">
      <Header chatId={id} />
      <Chat chatId={id} initialMessages={[]} />
    </div>
  );
}
