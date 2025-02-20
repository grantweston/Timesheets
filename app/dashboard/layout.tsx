import { UserButton } from "@clerk/nextjs";
import { Button } from "@/app/components/ui/button";
import { Clock } from "lucide-react";
import Link from "next/link";
import { DashboardNav } from "@/app/components/features/dashboard/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-50/80 dark:from-background dark:via-background/95 dark:to-background/90">
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 p-1.5 text-white shadow-md">
              <Clock className="h-4 w-4" />
            </div>
            <span>TimeTrack AI</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 md:pt-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-4 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 md:sticky md:block">
          <DashboardNav />
        </aside>
        <main className="relative flex w-full flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
} 