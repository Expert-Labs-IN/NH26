import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, History, Bell, User } from "lucide-react";
import { cn } from "@/utils/cn";

const navigation = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tickets', href: '/reports', icon: History },
  { name: 'Chat', href: '/chat', icon: MessageSquare, primary: true },
  { name: 'Alerts', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function UserBottomNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 pb-safe">
      <nav className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }: { isActive: boolean }) => cn(
              "flex flex-col items-center gap-1 transition-all duration-200",
              item.primary 
                ? "relative -top-3 transform" 
                : isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            )}
          >
            {item.primary ? (
              <div className="bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-500/40 text-white active:scale-90 transition-transform">
                <item.icon className="h-7 w-7" />
              </div>
            ) : (
              <>
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
