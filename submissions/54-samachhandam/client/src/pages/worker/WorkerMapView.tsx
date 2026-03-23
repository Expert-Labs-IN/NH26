import { MapPin, Navigation, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";

const markers = [
  { id: '1', type: 'Plastic', lat: 51.5237, lng: -0.1585, address: '221B Baker St', priority: 'High' },
  { id: '2', type: 'Organic', lat: 51.5300, lng: -0.1600, address: 'Regent Park', priority: 'Medium' },
  { id: '3', type: 'Hazardous', lat: 51.5200, lng: -0.1500, address: 'Marylebone Rd', priority: 'High' },
];

export default function MapView() {
  const [selectedTask, setSelectedTask] = useState<any>(null);

  return (
    <div className="h-[calc(100vh-144px)] -mx-4 -mt-6 relative overflow-hidden">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
         {/* Grid pattern mock */}
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
         
         <div className="relative w-full h-full">
            {markers.map((marker) => (
               <button
                  key={marker.id}
                  onClick={() => setSelectedTask(marker)}
                  className={cn(
                    "absolute p-2 rounded-full shadow-lg transition-all active:scale-95 group",
                    marker.priority === 'High' ? "bg-red-500" : "bg-blue-500",
                    selectedTask?.id === marker.id ? "ring-4 ring-white dark:ring-zinc-950 scale-125 z-20" : "scale-100 z-10"
                  )}
                  style={{ 
                    top: `${(marker.lat - 51.5) * 5000}%`, 
                    left: `${(marker.lng + 0.16) * 5000}%` 
                  }}
               >
                  <MapPin className="h-5 w-5 text-white" />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold">
                     {marker.type}
                  </div>
               </button>
            ))}
         </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
         <button className="h-10 w-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
            <Navigation className="h-5 w-5 text-blue-600" />
         </button>
      </div>

      {/* Quick Peek Card */}
      {selectedTask && (
        <div className="absolute bottom-6 left-4 right-4 animate-in slide-in-from-bottom-10 duration-300">
           <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 flex gap-4">
              <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                 <MapPin className={cn("h-8 w-8", selectedTask.priority === 'High' ? "text-red-500" : "text-blue-500")} />
              </div>
              <div className="flex-1 space-y-1">
                 <div className="flex justify-between items-start">
                    <h4 className="font-bold text-zinc-900 dark:text-white">{selectedTask.type} Waste</h4>
                    <span className="text-[10px] font-black text-red-500 uppercase">{selectedTask.priority}</span>
                 </div>
                 <p className="text-xs text-zinc-500 truncate">{selectedTask.address}</p>
                 <div className="flex gap-2 pt-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold active:scale-95 transition-transform">Start Task</button>
                    <button className="px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 rounded-lg active:scale-95 transition-transform" onClick={() => setSelectedTask(null)}>
                       <Info className="h-4 w-4" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
