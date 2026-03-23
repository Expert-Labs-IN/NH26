import { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Zap,
  Loader2,
  Navigation
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";
import { api } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import type ITask from "@/@types/interface/task.interface";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [availableComplains, setAvailableComplains] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user?._id) return;
      const [tasksRes, complainsRes] = await Promise.all([
        api.task.getTasksByWorkerId(user._id),
        api.complain.getComplainsByFilter({ status: 'Pending' })
      ]);

      let tasksData = tasksRes?.data || [];
      let complainsData = complainsRes.success ? (complainsRes.data.complains || complainsRes.data || []) : [];

      // DUMMY DATA FALLBACK (Demo mode)
      if (tasksData.length === 0 && complainsData.length === 0) {
        tasksData = [
          { _id: 't1', title: 'Clear Trash at Central Park', description: 'Overflowing bins near North Gate', status: 'Pending', priority: 'High', createdAt: new Date().toISOString() },
          { _id: 't2', title: 'Collect Recyclables', description: 'Wall Street Office Complex', status: 'In Progress', priority: 'Normal', createdAt: new Date().toISOString() }
        ];
        complainsData = [
          { _id: 'c1', title: 'New: Waste Spill', description: '5th Ave & 23rd St', status: 'Pending', area: 'Downtown' },
          { _id: 'c2', title: 'New: Illegal Dumping', description: 'Industrial Zone 4', status: 'Pending', area: 'West Port' }
        ];
      }

      setTasks(tasksData);
      setAvailableComplains(complainsData);
    } catch (error) {
      console.error("Error fetching worker data:", error);
      // Fallback
      setTasks([{ _id: 't1', title: 'Demo Task', status: 'Pending', priority: 'Normal' } as any]);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchAllData();
    }
  }, [user?._id, fetchAllData]);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      if (taskId.startsWith('t')) { // Dummy
         setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus as any } : t));
         alert("Demo: Status updated!");
         return;
      }
      const response = await api.task.updateTaskStatus(taskId, newStatus);
      if (response.success) {
        fetchAllData();
      }
    } catch (error) {
       console.error("Failed to update status", error);
    }
  };

  const handleAcceptComplain = async (complainId: string) => {
    if (!window.confirm("Accept this service request?")) return;
    try {
      if (complainId.startsWith('c')) { // Dummy
         alert("Demo: Request accepted!");
         setAvailableComplains(prev => prev.filter(c => c._id !== complainId));
         setTasks(prev => [...prev, { _id: 't' + Date.now(), title: 'Accepted Request', status: 'In Progress', priority: 'Normal', createdAt: new Date().toISOString() } as any]);
         return;
      }
      const now = new Date();
      const response = await api.complain.acceptComplain(complainId, now);
      if (response.success) {
        fetchAllData();
      }
    } catch (error) {
       console.error("Failed to accept complaint", error);
    }
  };

  const stats = [
    { label: 'Active Tasks', value: tasks.filter(t => t.status !== 'Completed').length, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Points', value: '1,250', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  if (isLoading && !tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs animate-pulse">Syncing Mission Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0] || 'Worker'}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">You have {tasks.filter(t => t.status !== 'Completed').length} active assignments for today.</p>
        </div>
        <Link 
          to="/worker/pending"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all font-medium text-sm"
        >
          <Navigation className="h-4 w-4" />
          View Radar
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Active Assignments
            </h2>
            <Link to="/worker/tasks" className="text-blue-600 text-xs font-semibold hover:underline px-2 py-1">View All</Link>
          </div>

          <div className="space-y-4">
            {tasks.filter(t => t.status !== 'Completed').length > 0 ? (
              tasks.filter(t => t.status !== 'Completed').map((task) => (
                <div key={task._id} className="group bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-blue-500/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider",
                          task.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                        )}>
                          {task.priority || 'Normal'}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          {task.status || 'Assigned'}
                        </span>
                      </div>
                      <h4 className="font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                    </div>
                    <button className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-blue-600 transition-colors border border-zinc-100 dark:border-zinc-700">
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-1">{task.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdateStatus(task._id!, 'Completed')}
                      className="flex-1 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs uppercase tracking-wider shadow-sm hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all active:scale-95"
                    >
                      Mark Complete
                    </button>
                    <button className="h-10 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold text-xs uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      Route
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
                <p className="text-zinc-500 text-sm font-medium">No active tasks. Check the radar for new requests!</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Requests Side Panel */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Service Radar
            </h2>
            <Link to="/worker/pending" className="text-blue-600 text-xs font-semibold hover:underline">Full View</Link>
          </div>

          <div className="space-y-3">
            {availableComplains.slice(0, 3).length > 0 ? (
              availableComplains.slice(0, 3).map((complain) => (
                <div key={complain._id} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{complain.area || 'Nearby'}</p>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">{complain.title || 'Waste Report'}</h4>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                  </div>
                  
                  <button 
                    onClick={() => handleAcceptComplain(complain._id)}
                    className="w-full py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all border border-blue-100 dark:border-blue-900/30"
                  >
                    Claim Request
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                 <AlertCircle className="h-6 w-6 text-zinc-300 mx-auto mb-2" />
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Scanning Grid...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
