import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Map as MapIcon, History, Recycle, LogOut, Bell } from "lucide-react";
import { cn } from "@/utils/cn";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: 'Dashboard', href: '/worker/dashboard', icon: LayoutDashboard },
  { name: 'Pending', href: '/worker/pending', icon: Bell },
  { name: 'All Tasks', href: '/worker/tasks', icon: ClipboardList },
  { name: 'Live Map', href: '/worker/map', icon: MapIcon },
  { name: 'Completed', href: '/worker/history', icon: History },
];

export default function WorkerSidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 hidden lg:flex flex-col z-50">
      {/* Branding */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 text-white">
            <Recycle className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-zinc-900 dark:text-white leading-tight tracking-tight">ResolveX Worker</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }: { isActive: boolean }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
              isActive
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
              "group-[.active]:text-blue-600"
            )} />
            <span className="text-sm tracking-tight">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Bottom Actions */}
      <div className="p-4 mt-auto space-y-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-inner uppercase">
              {user?.name?.substring(0, 2) || "W1"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user?.name || "Worker User"}</span>
              <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Verified Worker</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
            <ThemeToggle />
            <div className="flex gap-1">
              <button className="relative p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full ring-2 ring-zinc-50 dark:ring-zinc-900" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-red-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
