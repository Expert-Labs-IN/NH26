import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, User, Menu, Circle, LogOut, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-zinc-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 items-center" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">Search</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" aria-hidden="true" />
          <Input
            id="search-field"
            className="block h-10 w-full rounded-xl border-0 bg-zinc-50 dark:bg-zinc-900 pl-10 pr-0 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:ring-0 sm:text-sm"
            placeholder="Search complaints, users..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <ThemeToggle />
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-zinc-400 hover:text-zinc-500"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
            </Button>

            {notificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setNotificationsOpen(false)} 
                />
                <div className="absolute right-0 mt-3 z-50 w-80 origin-top-right rounded-2xl bg-white dark:bg-zinc-900 py-2 shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 animate-in fade-in slide-in-from-top-2 border border-zinc-200 dark:border-zinc-800">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Notifications</h3>
                    <Badge className="bg-blue-100 text-blue-700">3 New</Badge>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[
                      { id: 1, title: 'New Complaint', desc: 'Waste overflow reported at Sector 4', time: '5m ago' },
                      { id: 2, title: 'Driver Assigned', desc: 'John D. assigned to Task #1042', time: '12m ago' },
                      { id: 3, title: 'System Alert', desc: 'Scheduled maintenance at 2:00 AM', time: '2h ago' },
                    ].map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors border-b border-zinc-50 last:border-0 border-zinc-100 dark:border-zinc-800">
                        <div className="flex justify-between items-start mb-1">
                           <p className="text-sm font-bold text-zinc-900 dark:text-white">{n.title}</p>
                           <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                        </div>
                        <p className="text-xs text-zinc-500 leading-tight">{n.desc}</p>
                        <p className="text-[10px] text-zinc-400 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
                    <Button variant="link" size="sm" className="text-blue-600 dark:text-blue-400 text-xs font-bold p-0 h-auto">Mark all as read</Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-200 dark:lg:bg-zinc-800" aria-hidden="true" />

          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">{user?.name || "Admin User"}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">System Administrator</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-inner">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <ChevronDown className={cn("hidden sm:block h-4 w-4 text-zinc-500 transition-transform", isMenuOpen && "rotate-180")} />
            </button>

            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-zinc-50 dark:border-zinc-800 pb-3 mb-2">
                     <p className="text-sm font-bold text-zinc-900 dark:text-white">{user?.name || "Admin User"}</p>
                     <p className="text-[10px] text-zinc-500 font-medium">System Administrator</p>
                  </div>
                  
                  <Link 
                    to="/admin/users" 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Manage Users
                  </Link>
                  
                  <div className="border-t border-zinc-50 dark:border-zinc-800 mt-2 pt-2">
                    <button 
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 w-full text-left transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
