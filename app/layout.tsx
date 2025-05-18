import HeaderAuthClient from "@/components/header-auth-client";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { UserProvider } from "@/context/UserContext";
import { QueryProvider } from "@/context/QueryProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import "./globals.css";
import { paths } from "@/utils/paths";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const {user} = useUser()
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <QueryProvider>
              <main className="min-h-[calc(100vh-64px)] flex flex-col items-center">
                <div className="flex-1 w-full flex flex-col items-center">
                  <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                    <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                      <div className="flex gap-8 items-center font-semibold">
                        <Link href={paths.home}>Cats Site</Link>
                        <div className="flex gap-4 items-center font-semibold">
                          <Link href={paths.cats}>Cats List</Link>
                        </div>
                      </div>
                      <HeaderAuthClient />
                    </div>
                  </nav>
                  <div className="flex flex-col max-w-5xl p-5">{children}</div>
                </div>
              </main>
            </QueryProvider>
          </UserProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
