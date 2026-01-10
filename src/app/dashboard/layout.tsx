import { DesktopSidebar } from "@/components/navigation/desktop-sidebar";
import { MobileNav } from "@/components/navigation/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <MobileNav />
          <div className="ml-4 font-bold font-display text-xl">ScoutPro</div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content */}
      <main className="flex-1 md:pl-[240px] min-h-screen w-full">
        {children}
      </main>
    </div>
  );
}
