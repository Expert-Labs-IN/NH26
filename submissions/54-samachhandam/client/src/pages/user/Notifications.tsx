import { useNotifications } from '@/context/NotificationProvider';
import { Badge } from "@/components/ui/badge";
import { Bell, Info, CheckCircle2, AlertTriangle, XCircle, Trash2, CheckSquare } from "lucide-react";
import { cn } from "@/utils/cn";

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error': return <XCircle size={16} className="text-rose-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-zinc-500 text-sm font-medium">Keep track of your ticket updates and community alerts.</p>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={markAllAsRead}
                className="h-9 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider"
            >
                <CheckSquare size={14} />
                <span>Mark All Read</span>
            </button>
            <button 
                onClick={clearNotifications}
                className="h-9 px-4 bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-900 dark:border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider"
            >
                <Trash2 size={14} />
                <span>Clear All</span>
            </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={cn(
                "p-5 rounded-2xl border transition-all flex items-start gap-5 cursor-pointer group relative overflow-hidden",
                notif.read 
                  ? 'bg-white/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800/50' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'
              )}
            >
              <div className={cn(
                "p-3 rounded-xl shadow-sm mt-0.5 transition-transform group-hover:scale-105 duration-300",
                notif.read ? 'bg-zinc-50 dark:bg-zinc-800' : 'bg-blue-50 dark:bg-blue-500/10'
              )}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 space-y-1 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "font-bold text-sm uppercase tracking-tight",
                    notif.read ? 'text-zinc-500' : 'text-zinc-900 dark:text-white'
                  )}>{notif.title}</h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">{notif.message}</p>
                {!notif.read && (
                    <div className="pt-1">
                       <Badge variant="default" className="text-[8px] uppercase font-bold tracking-widest bg-blue-600 hover:bg-blue-600 rounded-lg px-2">New Update</Badge>
                    </div>
                )}
              </div>

              {!notif.read && <div className="absolute top-0 right-0 h-full w-1 bg-blue-600" />}
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center">
             <div className="h-16 w-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Bell className="text-zinc-200 dark:text-zinc-700" size={32} />
             </div>
             <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">Inbox Empty</h3>
             <p className="text-zinc-400 text-xs font-medium max-w-xs mx-auto mt-2 leading-relaxed">
                Everything is quiet right now. We'll notify you here when there are updates.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
