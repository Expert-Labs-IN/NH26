import { NavLink } from "react-router-dom";
import { LayoutDashboard, Ticket, Bell, User, PlusCircle } from "lucide-react";
import { cn } from "@/utils/cn";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  // { name: 'Chat Support', href: '/chat', icon: MessageSquare },
  { name: 'My Complaints', href: '/reports', icon: Ticket },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function UserSidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:border-r lg:border-zinc-200 lg:dark:border-zinc-800 lg:bg-white lg:dark:bg-zinc-950 p-6">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="bg-blue-600 p-2 rounded-full">
          <PlusCircle className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">ResolveX AI</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }: { isActive: boolean }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group",
              isActive
                ? "bg-blue-600 text-white "
                : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110")} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
