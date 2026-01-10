"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Shield,
  Trophy,
  User,
  LogOut,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports" },
  { icon: Users, label: "Players", href: "/dashboard/players" },
  { icon: Shield, label: "Teams", href: "/dashboard/teams" },
  { icon: Trophy, label: "Competitions", href: "/dashboard/competitions" },
  { icon: Upload, label: "Import Data", href: "/dashboard/import" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

interface AppNavProps {
  onNavigate?: () => void;
}

export function AppNav({ onNavigate }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex flex-col h-full bg-card">
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
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut size={20} />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
