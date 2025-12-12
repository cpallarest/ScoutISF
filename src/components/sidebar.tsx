"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Users, Shield, Trophy, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports" },
  { icon: Users, label: "Players", href: "/dashboard/players" },
  { icon: Shield, label: "Teams", href: "/dashboard/teams" },
  { icon: Trophy, label: "Competitions", href: "/dashboard/competitions" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-[240px] bg-card border-r border-border h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold font-display tracking-tight text-white">
          Scout<span className="text-primary">Pro</span>
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut size={20} />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
