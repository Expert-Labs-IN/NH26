import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Plus, Activity, Clock, CheckCircle2, AlertCircle, ChevronRight, LayoutDashboard, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!user?._id) return;
    setIsLoading(true);
    try {
      const res = await api.complain.getComplainsByUserId(user._id);
      if (res.success) {
        setComplaints(res.data.complains || res.data || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleStartChat = async () => {
    try {
      const res = await api.chat.createSession();
      if (res.success) {
        navigate(`/chat/${res.data.session_id}`);
      }
    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };

  const stats = [
    { label: "Total Filed", value: complaints.length, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Resolved", value: complaints.filter(c => c.status === 'resolved' || c.status === 'Completed').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending", value: complaints.filter(c => c.status === 'pending' || c.status === 'Pending').length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* Search/Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">User Dashboard</h1>
          <p className="text-zinc-500 text-sm font-medium">Manage your reports and track resolution progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartChat}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/10"
          >
            <MessageSquare size={16} />
            AI Assistant
          </button>

        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-white leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <LayoutDashboard size={14} className="text-blue-600" />
              Recent Reports
            </h3>
            <button
              onClick={() => navigate("/reports")}
              className="text-[10px] font-bold text-zinc-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
            >
              View History
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-5 animate-pulse flex items-center gap-4">
                    <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                      <div className="h-2 w-1/2 bg-zinc-50 dark:bg-zinc-800/50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : complaints.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                {complaints.slice(0, 5).map((item) => (
                  <div key={item._id} className="p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center border",
                        item.status === 'resolved' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-blue-50 border-blue-100 text-blue-600"
                      )}>
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight line-clamp-1">{item.title || item.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="h-1 w-1 rounded-full bg-zinc-200" />
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            item.status === 'resolved' ? "text-emerald-600" : "text-amber-500"
                          )}>{item.status}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-zinc-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4">
                <div className="h-16 w-16 bg-white dark:bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center shadow-md">
                  <AlertCircle className="text-zinc-300 dark:text-zinc-600" size={32} />
                </div>
                <div className="max-w-xs mx-auto space-y-1">
                  <p className="text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-widest">No Active Reports</p>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                    You haven't filed any complaints yet. Start by reporting an issue in your neighborhood.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info/Quick Links Panel */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="relative z-10 space-y-2">
              <h4 className="text-lg font-bold tracking-tight">Need Help?</h4>
              <p className="text-blue-100 text-xs font-medium leading-relaxed">Our AI assistant can help you categorize and file complaints in seconds.</p>
              <button
                onClick={handleStartChat}
                className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors"
              >
                Learn More
              </button>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Resolution</h4>
            <div className="space-y-4">
              {[
                { label: "Community Center", val: "85%", color: "bg-emerald-500" },
                { label: "Waste Management", val: "92%", color: "bg-blue-500" },
              ].map(i => (
                <div key={i.label} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                    <span>{i.label}</span>
                    <span>{i.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", i.color)} style={{ width: i.val }} />
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