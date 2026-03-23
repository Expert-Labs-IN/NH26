import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, ChevronRight, PlayCircle, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";

export default function TaskList() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?._id) return;
      try {
        const response: any = await api.task.getTasksByWorker(user._id);
        if (response.success) {
          setTasks(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?._id]);

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'All' || task.status === filter;
    const searchMatch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <section className="px-1">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Assigned Tasks</h1>
        <p className="text-sm text-zinc-500 font-medium mt-1">Manage and execute your assigned pickups.</p>
      </section>

      {/* Search & Filter */}
      <div className="sticky top-[72px] z-30 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-xl py-4 -mx-4 px-4 space-y-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap">
          {['All', 'Pending', 'In Progress', 'Completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 border",
                filter === f 
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10" 
                  : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
          <div 
            key={task._id || task.id} 
            className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4 hover:shadow-md hover:border-blue-500/20 transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col gap-2">
                 <Badge variant="secondary" className="w-fit uppercase tracking-wider text-[9px] font-semibold px-2.5 py-0.5">
                    {task.priority || 'Normal'}
                 </Badge>
                 <h3 className="font-semibold text-zinc-900 dark:text-white text-lg leading-tight group-hover:text-blue-600 transition-colors tracking-tight uppercase">
                   {task.title}
                 </h3>
              </div>
              <div className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border",
                task.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : 
                task.status === 'In Progress' ? "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20" : 
                "bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700"
              )}>
                {task.status}
              </div>
            </div>

            <div className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl relative z-10 border border-transparent group-hover:border-zinc-200/20 transition-all">
              <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{task.description}</p>
            </div>

            <div className="flex items-center justify-between pt-1 relative z-10">
               <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Navigation className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
               </div>
               <div className="flex gap-2">
                 <Link 
                   to={`/worker/tasks/${task._id || task.id}`} 
                   className="h-10 px-5 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl font-semibold text-[11px] uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                 >
                    Details <ChevronRight className="h-4 w-4" />
                 </Link>
                 {task.status === 'Pending' && (
                   <Link 
                     to={`/worker/tasks/${task._id || task.id}`}
                     className="h-10 px-5 bg-blue-600 text-white rounded-xl font-semibold text-[11px] uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-500/20"
                   >
                      <PlayCircle className="h-4 w-4" /> Start
                   </Link>
                 )}
               </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl text-center">
            <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-zinc-200 dark:text-zinc-700" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">No Tasks Found</h3>
            <p className="text-sm text-zinc-400 font-medium max-w-[200px] mt-1 leading-relaxed">Adjust your filters to discover assigned pickups.</p>
          </div>
        )}
      </div>
    </div>
  );
}
