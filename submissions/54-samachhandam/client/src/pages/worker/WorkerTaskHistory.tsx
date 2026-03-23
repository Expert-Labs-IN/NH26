import { CheckCircle2, MapPin, Calendar, Camera, History as HistoryIcon } from "lucide-react";

// Dummy history data for demo purposes
const history = [
  { id: '1', type: 'Plastic Waste Collection', address: '221B Baker Street', date: 'Oct 24, 2023', time: '02:30 PM', proof: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b21b?auto=format&fit=crop&q=80&w=400' },
  { id: '2', type: 'Organic Waste Disposal', address: '10 Downing St', date: 'Oct 23, 2023', time: '11:15 AM', proof: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400' },
  { id: '3', type: 'Hazardous Material Handling', address: 'Marylebone Rd', date: 'Oct 22, 2023', time: '04:45 PM', proof: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400' },
];

export default function TaskHistory() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <section className="px-1">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Task History</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Review your successfully completed service calls and missions.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-all">
             <div className="aspect-video relative overflow-hidden">
                <img src={item.proof} alt="Proof" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl text-white">
                      <Camera className="h-5 w-5" />
                   </div>
                </div>
                <div className="absolute top-3 left-3">
                   <div className="bg-emerald-500 text-white p-1 rounded-lg shadow-lg">
                      <CheckCircle2 className="h-4 w-4" />
                   </div>
                </div>
             </div>
             
             <div className="p-5 space-y-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">{item.time}</p>
                   <h3 className="font-semibold text-zinc-900 dark:text-white text-base leading-tight uppercase tracking-tight">{item.type}</h3>
                </div>
                
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                   <MapPin className="h-3.5 w-3.5" />
                   <span className="text-xs font-medium truncate">{item.address}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-50 dark:border-zinc-800/50">
                   <div className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{item.date}</span>
                   </div>
                   <button className="text-blue-600 text-[10px] font-bold uppercase tracking-widest hover:underline">
                      View Log
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {history.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50/50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
           <div className="h-16 w-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <HistoryIcon className="h-8 w-8 text-zinc-300" />
           </div>
           <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Empty History</h3>
           <p className="text-sm font-medium text-zinc-400 mt-1">No completed tasks yet. Missions will appear here once verified.</p>
        </div>
      )}
    </div>
  );
}
