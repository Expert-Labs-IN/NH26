import { useAuth } from '@/context/AuthContext';
import { Mail, Phone, LogOut, Shield, MapPin, ChevronRight, Edit3, Camera } from 'lucide-react';
import { cn } from "@/utils/cn";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Hero */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-10 md:p-12 border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-36 md:h-36 bg-zinc-900 text-white rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-bold shadow-xl border-4 border-white dark:border-zinc-800 uppercase tracking-tighter">
              {user?.name?.[0]}
            </div>
            <button className="absolute -bottom-1 -right-1 p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all border-4 border-white dark:border-zinc-900">
              <Camera size={16} />
            </button>
          </div>

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none uppercase">{user?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg text-xs font-semibold">{user?.role} Account</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg text-xs font-semibold">Eco Guardian Level 4</span>
            </div>
          </div>
        </div>

        {/* Background Accent */}
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
      </div>

      <div className="grid  gap-8">
        <div className="md:col-span-2 space-y-8">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white px-2">Account Information</h3>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-3">
              {[
                { icon: <Mail size={16} />, label: "Email Address", value: user?.email, color: "text-blue-500 bg-blue-500/10" },
                { icon: <Phone size={16} />, label: "Mobile Phone", value: user?.mobile || "Not Linked", color: "text-amber-500 bg-amber-500/10" },
                { icon: <MapPin size={16} />, label: "Service Location", value: user?.location?.address || user?.location?.city || "Surat, Gujarat", color: "text-emerald-500 bg-emerald-500/10" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-5 rounded-2xl transition-all">
                  <div className="flex items-center gap-5">
                    <div className={cn("p-3 rounded-xl", item.color)}>
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{item.label}</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                    <Edit3 size={14} className="text-zinc-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
