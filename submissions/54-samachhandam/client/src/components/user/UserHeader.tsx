import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, User, History, LogOut, ChevronDown, Moon, Sun, MessageSquare } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useAuth } from "@/context/AuthContext";

export default function UserHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/10">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">ResolveX</span>
      </div>

      <div className="hidden lg:block">
         <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">System Monitoring Active</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl h-10 w-10 transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
        </Button>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 p-1 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all group border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
          >
            <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm uppercase tracking-tighter">
              {user?.name?.substring(0, 2) || "JD"}
            </div>
            <div className="hidden sm:block text-left mr-1">
               <p className="text-[11px] font-bold text-zinc-900 dark:text-white leading-none uppercase tracking-tight">{user?.name?.split(" ")[0] || "User"}</p>
            </div>
            <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-400 transition-transform duration-300", isMenuOpen && "rotate-180")} />
          </button>

          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-zinc-50 dark:border-zinc-800 mb-2">
                   <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{user?.name || "John Doe"}</p>
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Resident Pro</p>
                </div>
                
                <div className="space-y-0.5 px-1">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all uppercase tracking-tight"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Account Settings
                  </Link>
                  
                  <Link 
                    to="/reports" 
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all uppercase tracking-tight"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <History className="h-4 w-4" />
                    My Report Log
                  </Link>

                  <div className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 rounded-xl transition-all uppercase tracking-tight">
                    <div className="flex items-center gap-3">
                        <Moon className="h-4 w-4 dark:hidden text-blue-600" />
                        <Sun className="h-4 w-4 hidden dark:block text-amber-500" />
                        Night Mode
                    </div>
                    <ThemeToggle />
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-50 dark:border-zinc-800 px-1">
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 w-full text-left rounded-xl transition-all uppercase tracking-tight"
                  >
                    <LogOut className="h-4 w-4" />
                    Secure Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
