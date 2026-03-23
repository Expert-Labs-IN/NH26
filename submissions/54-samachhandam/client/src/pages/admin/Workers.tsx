import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Truck, Phone, Mail, Loader2, MapPin, Calendar } from "lucide-react";
import { api } from "@/utils/api";
import { cn } from "@/utils/cn";

interface IWorker {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: string;
  createdAt: string;
  status?: string;
}

export default function WorkersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [workers, setWorkers] = useState<IWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const res = await api.user.getAllDrivers();
      let data = res?.data || [];

      // DUMMY DATA FALLBACK
      if (data.length === 0) {
        data = [

        ];
      }

      setWorkers(data);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setWorkers([
        { _id: 'w1', name: 'Demo Worker', email: 'demo@worker.com', mobile: '9999999999', role: 'worker', createdAt: new Date().toISOString(), status: 'On Duty' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.mobile?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Worker Management</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 uppercase text-[10px] font-bold tracking-widest">Monitor and manage waste collection staff and drivers.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name, email, or mobile..."
            className="pl-10 h-11 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Truck className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            {filteredWorkers.length} Personnel Active
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-left">
                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Worker Profile</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-left">Contact Info</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-left">Joined Date</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Retrieving Fleet Data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredWorkers.length > 0 ? (
                filteredWorkers.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center font-bold text-blue-600 group-hover:scale-105 transition-transform border border-blue-100 dark:border-blue-900/20 uppercase tracking-tight">
                          {item.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-black text-zinc-900 dark:text-white uppercase  mb-1">{item.name}</div>
                          <div className="text-[9px] text-zinc-400 font-bold flex items-center gap-1 uppercase tracking-[0.1em]">
                            <Truck className="h-3 w-3" /> Fleet Member / Collector
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="space-y-1">
                        {item.email && (
                          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                            <Mail className="h-3 w-3" />
                            <span className="text-[10px] font-bold lowercase italic">{item.email}</span>
                          </div>
                        )}
                        {item.mobile && (
                          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                            <Phone className="h-3 w-3" />
                            <span className="text-[10px] font-black tracking-widest">{item.mobile}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-black text-[10px] uppercase text-left tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          item.status === 'Off Duty' ? 'bg-zinc-400' :
                            item.status === 'Break' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                              'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        )} />
                        <span className={cn(
                          "font-black text-[9px] uppercase tracking-widest",
                          item.status === 'Off Duty' ? 'text-zinc-500' :
                            item.status === 'Break' ? 'text-amber-600 dark:text-amber-400' :
                              'text-emerald-600 dark:text-emerald-400'
                        )}>
                          {item.status || 'Active'}
                        </span>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                    No personnel matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
