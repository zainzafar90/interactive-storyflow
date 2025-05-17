"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import type { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { LoaderIcon } from "./icons";
import { guestRegex } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function UserProfileDropdown({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, theme } = useTheme();

  const isGuest = guestRegex.test(data?.user?.email ?? "");

  const dropdownContent = (
    <DropdownMenuContent
      data-testid="user-nav-menu"
      side="top"
      align="end"
      className="w-[--radix-popper-anchor-width]"
    >
      <DropdownMenuItem
        data-testid="user-nav-item-theme"
        className="cursor-pointer"
        onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {`Toggle ${theme === "light" ? "dark" : "light"} mode`}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild data-testid="user-nav-item-auth">
        <button
          type="button"
          className="w-full cursor-pointer"
          onClick={() => {
            if (status === "loading") {
              toast({
                type: "error",
                description:
                  "Checking authentication status, please try again!",
              });

              return;
            }

            if (isGuest) {
              router.push("/login");
            } else {
              signOut({
                redirectTo: "/",
              });
            }
          }}
        >
          {isGuest ? "Login to your account" : "Sign out"}
        </button>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {status === "loading" ? (
          <Button
            variant="outline"
            className="relative flex items-center gap-2 rounded-full"
          >
            <div className="size-4 bg-zinc-500/30 rounded-full animate-pulse" />
            <span className="bg-zinc-500/30 text-transparent rounded-md animate-pulse">
              Loading...
            </span>
            <div className="animate-spin text-zinc-500">
              <LoaderIcon size={16} />
            </div>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-full truncate max-w-80"
            data-testid="user-email-header"
          >
            <Image
              src={`https://avatar.vercel.sh/${user.email}`}
              alt={user.email ?? "User Avatar"}
              width={16}
              height={16}
              className="rounded-full"
            />
            <span className="truncate">{isGuest ? "Guest" : user?.email}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        )}
      </DropdownMenuTrigger>
      {dropdownContent}
    </DropdownMenu>
  );
}
