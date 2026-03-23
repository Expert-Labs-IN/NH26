import { useState, useEffect } from 'react';
import { Users, ClipboardList, Loader2 } from "lucide-react";
import { api } from "@/utils/api";

export default function StatsGrid() {
  const [stats, setStats] = useState([
    { name: "Total Users", value: "0", icon: Users, description: "Registered residents", color: "text-blue-600" },
    { name: "Total Workers", value: "0", icon: Users, description: "Active drivers & cleaners", color: "text-emerald-600" },
    { name: "Total Complaints", value: "0", icon: ClipboardList, description: "Across all statuses", color: "text-amber-600" },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [complaintsRes, workersRes, usersRes] = await Promise.all([
          api.complain.getAllComplains(),
          api.user.getAllDrivers(),
          api.user.getAllUsers()
        ]);

        const complaints = complaintsRes?.data?.complains || complaintsRes?.data || [];
        const workers = workersRes?.data || [];
        const users = usersRes?.data || [];

        setStats([
          { name: "Total Users", value: Array.isArray(users) ? users.length.toString() : "0", icon: Users, description: "Registered residents", color: "text-blue-600" },
          { name: "Total Workers", value: Array.isArray(workers) ? workers.length.toString() : "0", icon: Users, description: "Active drivers & cleaners", color: "text-emerald-600" },
          { name: "Total Complaints", value: Array.isArray(complaints) ? complaints.length.toString() : "0", icon: ClipboardList, description: "Across all statuses", color: "text-amber-600" },
        ]);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md group"
        >
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">{stat.name}</p>
            <div className="flex items-baseline gap-2">
              <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-zinc-300" /> : stat.value}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{stat.description}</p>
          </div>

          <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color}`}>
            <stat.icon className="h-24 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
