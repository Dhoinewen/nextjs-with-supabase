'use client';

import { useUser } from "@/context/UserContext";
import { paths } from "@/utils/paths";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import FullScreenLoader from "@/components/loaders/full-screen-loader";

interface SignInRequiredProps {
  children: React.ReactNode;
}

export default function SignInRequired({ children }: SignInRequiredProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Handle sign in button click
  const handleSignIn = () => {
    router.push(paths.signIn);
  };

  // Show loading state
  if (isLoading) {
    return (
      <FullScreenLoader/>
    );
  }

  // If not authenticated, show sign in required message
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-104px)] p-4">
        <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-6 text-muted-foreground">
            You need to be signed in to access this page. Please sign in to continue.
          </p>
          <Button onClick={handleSignIn} className="w-full">
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}
