import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Map as MapIcon, History, Bell } from "lucide-react";
import { cn } from "@/utils/cn";

const navigation = [
  { name: 'Home', href: '/worker/dashboard', icon: LayoutDashboard },
  { name: 'Pending', href: '/worker/pending', icon: Bell },
  { name: 'Tasks', href: '/worker/tasks', icon: ClipboardList },
  { name: 'Map', href: '/worker/map', icon: MapIcon },
  { name: 'History', href: '/worker/history', icon: History },
];

export default function WorkerBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 pb-safe lg:hidden">
      <nav className="flex items-center justify-around h-20 max-w-lg mx-auto px-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }: { isActive: boolean }) => cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300",
              isActive 
                ? "text-blue-600 dark:text-blue-400 scale-105" 
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">{item.name}</span>
                {/* Active Indicator */}
                <div className={cn(
                   "h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400 transition-opacity mt-0.5",
                   isActive ? "opacity-100" : "opacity-0"
                )} />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
