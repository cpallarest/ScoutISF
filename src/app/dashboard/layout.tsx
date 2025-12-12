import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Sidebar />
      <main className="pl-[240px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
