import SignInRequired from "@/components/sign-in-required";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SignInRequired>
      <div>
        {children}
      </div>
    </SignInRequired>
  );
}
