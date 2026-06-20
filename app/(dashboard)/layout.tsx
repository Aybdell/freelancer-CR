"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar className="h-full" />
      </aside>

      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar className="h-full" />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-40 flex items-center gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden dark:border-slate-700 dark:bg-slate-900/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            FreelanceCRM
          </h1>
        </div>

        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
