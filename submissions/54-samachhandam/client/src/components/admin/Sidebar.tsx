import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, BarChart3, LogOut, Recycle, Truck, Users, Briefcase } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Complaints', href: '/admin/complaints', icon: ClipboardList },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Workers', href: '/admin/workers', icon: Truck },
  { name: 'Occupations', href: '/admin/occupations', icon: Briefcase },
];



export default function Sidebar() {
  const { logout } = useAuth();
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center gap-3">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Recycle className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-zinc-900 dark:text-white">ResloveX</span>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    end={item.href === '/admin'}
                    className={({ isActive }: { isActive: boolean }) => cn(
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
                        : "text-zinc-700 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10",
                      "group flex gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 transition-all duration-200"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>

          <li className="mt-auto space-y-4">
            {/* User Details */}

            <button
              onClick={logout}
              className="w-full text-zinc-700 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 group flex gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
