"use client";

import Image from "next/image";
import { Share, GalleryHorizontalEnd, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";

import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { toast } from "./ui/toast";
import { useRouter } from "next/navigation";

export const Header = ({ chatId }: { chatId?: string }) => {
  const { data: sessionData } = useSession();
  const [copied, setCopied] = React.useState(false);
  const router = useRouter();

  const handleShare = async () => {
    if (!chatId) return;
    const url = `${window.location.origin}/chat/${chatId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        type: "error",
        description: "Failed to copy link",
      });
    }
  };

  const handleNew = () => {
    router.push(`/`);
  };

  return (
    <>
      <div className="relative h-36 -mx-4 -mt-4">
        <Image
          src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1080&auto=format&fit=crop"
          alt=""
          width={1000}
          height={1000}
          className="w-full h-full object-cover"
          priority
          blurDataURL="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=50&auto=format&fit=crop"
        />
      </div>
      <div className="flex flex-col w-full mx-auto max-w-2xl rounded-t-xl shadow-2xl z-10 -mt-20 mb-20 bg-background/50">
        <div className="relative flex items-center justify-between p-4 rounded-t-xl">
          <div className="flex items-center gap-3 mt-2">
            <div className="bg-zinc-800 p-2 rounded-md text-white">
              <GalleryHorizontalEnd className="size-6" />
            </div>
            <h1 className="text-xl font-semibold">Storio</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full"
              onClick={handleNew}
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full"
              onClick={handleShare}
              disabled={!chatId}
            >
              <Share className="h-4 w-4" />
              <span>{copied ? "Copied!" : "Share"}</span>
            </Button>

            {sessionData?.user && (
              <UserProfileDropdown user={sessionData.user} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
