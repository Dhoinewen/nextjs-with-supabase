"use client";

import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { paths } from "@/utils/paths";

const Login = () => {
  const { refreshUser } = useUser();
  const router = useRouter();

  const [signInError, setSignInError] = useState<string>("");

  const handleSignIn = async (formData: FormData) => {
    const signInResult = await signInAction(formData);
    if (signInResult.success) {
      await refreshUser();
      router.push(paths.profile);
    } else {
      setSignInError("Something went wrong!");
    }
  };

  return (
    <form
      className="flex-1 flex flex-col min-w-64"
      onChange={() => setSignInError("")}
    >
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link
          className="text-foreground font-medium underline"
          href={paths.signUp}
        >
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-foreground underline"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton
          pendingText="Signing In..."
          formAction={(formData) => handleSignIn(formData)}
        >
          Sign in
        </SubmitButton>
        {signInError && <FormMessage message={{ error: signInError }} />}
      </div>
    </form>
  );
};

export default Login;
