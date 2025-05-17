"use client";

import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { useUser } from "@/context/UserContext";
import { LogOut, User } from "lucide-react";
import { paths } from "@/utils/paths";

export default function AuthButtonClient() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>;
  }

  return user ? (
    <div className="flex items-center gap-4">
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"secondary"}>
          <Link href={paths.profile}>
            <User />
          </Link>
        </Button>
        <form action={signOutAction}>
          <Button type="submit" size={"sm"} variant={"outline"}>
            <LogOut />
          </Button>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href={paths.signIn}>Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href={paths.signUp}>Sign up</Link>
      </Button>
    </div>
  );
}
