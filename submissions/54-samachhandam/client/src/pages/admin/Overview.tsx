import { useState, useEffect } from 'react';
import StatsGrid from "@/components/admin/StatsGrid";
import OverviewCharts from "@/components/admin/OverviewCharts";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { cn } from "@/utils/cn";
import { api } from "@/utils/api";
import type IComplain from "@/@types/interface/complain.interface";

export default function Overview() {
  const [recentComplaints, setRecentComplaints] = useState<IComplain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'assigned': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  useEffect(() => {
    const fetchRecent = async () => {
      setIsLoading(true);
      try {
        const response = await api.complain.getAllComplains();
        const data = response?.data?.complains || response?.data || [];
        if (Array.isArray(data)) {
          setRecentComplaints(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching recent admin activity:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome back! Here's what's happening in your management area today.
          </p>
        </div>

      </div>

      <StatsGrid />
      
      <OverviewCharts />

      {/* Recent Activity */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 text-left">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Activity</h3>
          <Button variant="link" className="text-blue-600 dark:text-blue-400 p-0 text-xs font-bold uppercase tracking-widest">View all</Button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
               <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
               <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Processing...</span>
            </div>
          ) : recentComplaints.length > 0 ? (
            recentComplaints.map((activity) => (
              <div key={activity._id} className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 group cursor-default text-left">
                <div className="flex gap-4 items-center">
                   <div className="h-11 w-11 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 uppercase overflow-hidden border border-zinc-100 dark:border-zinc-700">
                      {activity.imageUrl ? (
                        <img src={activity.imageUrl} alt="Complaint" className="h-full w-full object-cover" />
                      ) : (
                        activity.title?.charAt(0) || activity.description?.charAt(0) || '?'
                      )}
                   </div>
                   <div className="text-left">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors truncate max-w-[200px] uppercase tracking-tight">
                        {activity.title || activity.description}
                      </h4>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1 font-medium italic mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {activity.address || "Area Report"}
                      </p>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase">
                    {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={cn(
                    "text-[9px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-widest border",
                    getStatusColor(activity.status)
                  )}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-400 font-bold text-xs uppercase tracking-widest">
               No recent activity recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
