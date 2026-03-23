import { NavLink, useLocation } from 'react-router-dom';
import { 
  Inbox, 
  Calendar, 
  Bell, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Mail,
  Zap,
  BarChart3
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-white/10 text-white shadow-lg' 
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`
    }
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded border border-secondary/20 uppercase tracking-tighter formular-mono">
        {badge}
      </span>
    )}
  </NavLink>
);

const Layout = ({ children }) => {
  const location = useLocation();
  const getPageName = () => {
    const path = location.pathname.split('/')[1];
    if (path === 'triage') return 'Pending Review';
    return path.charAt(0).toUpperCase() + path.slice(1) || 'Inbox';
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden selection:bg-secondary/30">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-white/5 bg-black/50 backdrop-blur-3xl flex flex-col p-6">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-glow-conic p-[1px]">
            <div className="w-full h-full rounded-lg bg-black flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white italic uppercase">
            Agentic AI
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-4 mb-4">Main Menu</div>
          <SidebarLink to="/inbox" icon={Inbox} label="Inbox" />
          <SidebarLink to="/triage" icon={ShieldCheck} label="Pending Review" badge="AI" />
          <SidebarLink to="/calendar" icon={Calendar} label="Calendar" />
          <SidebarLink to="/analytics" icon={BarChart3} label="Analytics" />
          
          <div className="pt-8 text-[10px] font-bold text-white/20 uppercase tracking-widest px-4 mb-4">System</div>
          <SidebarLink to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 transition-colors w-full">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-primary/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium text-white/40">Dashboard / <span className="text-white">{getPageName()}</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-white/40" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-black"></span>
            </button>
            <div className="h-8 w-px bg-white/5 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white/80">Mohit</span>
                <span className="text-[10px] text-white/30 uppercase tracking-tighter formular-mono">Executive</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/10 to-accent/10 border border-white/5 p-0.5">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mohit" 
                  alt="Avatar" 
                  className="w-full h-full rounded-[10px] bg-black"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
