import type { UserType } from "@/app/(auth)/auth";
import type { ChatModel } from "./models";

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel["id"]>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 5,
    availableChatModelIds: ["chat-model"],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 20,
    availableChatModelIds: ["chat-model"],
  },
};
