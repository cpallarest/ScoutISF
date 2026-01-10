import { AppNav } from "./app-nav";

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-[240px] border-r border-border h-screen fixed left-0 top-0 flex-col z-50">
      <AppNav />
    </aside>
  );
}
