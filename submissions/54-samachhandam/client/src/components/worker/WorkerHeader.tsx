import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Recycle, Circle, LogOut, User, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

export default function WorkerHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
          <Recycle className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">ResolveX Worker</span>
          <div className="flex items-center gap-1">
             <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
             <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Online</span>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="relative p-2 text-zinc-500 dark:text-zinc-400">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-blue-600 border border-blue-500 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-inner">
              {user?.name?.substring(0, 2) || "W1"}
            </div>
            <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform hidden sm:block", isMenuOpen && "rotate-180")} />
          </button>

          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-zinc-50 dark:border-zinc-800 pb-3 mb-2">
                   <p className="text-sm font-bold text-zinc-900 dark:text-white">{user?.name || "Worker User"}</p>
                   <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Verified Worker</p>
                </div>
                
                <Link 
                  to="/worker/dashboard" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  My Profile
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
    </header>
  );
}
