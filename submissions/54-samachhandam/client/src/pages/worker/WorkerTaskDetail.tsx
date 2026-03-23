import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Camera, CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";

export default function TaskDetail() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      try {
        const response: any = await api.task.getTaskById(taskId);
        if (response.success) {
          setTask(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch task details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === 'Completed' && !proofPreview) {
      alert("Please upload a proof photo before completing the task.");
      return;
    }
    
    if (!taskId) return;
    
    setIsUpdating(true);
    try {
      const response = await api.task.updateTaskStatus(taskId, newStatus);
      if (response.success) {
        setTask((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const openInMaps = () => {
    // If coordinates exist, use them; otherwise, use address string
    const destination = task?.coordinates?.lat ? `${task.coordinates.lat},${task.coordinates.lng}` : encodeURIComponent(task?.description || '');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <AlertCircle className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Task Not Found</h2>
        <Button onClick={() => navigate('/worker/tasks')} className="mt-4 bg-blue-600 text-white rounded-xl">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="group flex items-center gap-2 text-zinc-500 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center group-hover:border-blue-500/50 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </div>
        Back to Tasks
      </button>

      {/* Task Header */}
      <section className="space-y-4 px-1">
         <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex-1 uppercase">
              {task.title}
            </h1>
            <Badge variant={task.priority?.toLowerCase() === 'high' ? 'danger' : 'warning'} className="mt-1.5 uppercase tracking-wider text-[10px] font-bold px-3 py-1.5 h-fit">
              {task.priority || 'Normal'} Priority
            </Badge>
         </div>
         <div className="flex items-center gap-2">
            <div className={cn(
              "h-2.5 w-2.5 rounded-full",
              task.status === 'Completed' ? "bg-emerald-500" : task.status === 'In Progress' ? "bg-orange-500 animate-pulse" : "bg-zinc-300"
            )} />
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{task.status}</span>
         </div>
      </section>

      {/* Hero Image Container */}
      <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-2xl relative group">
        <img 
          src={task.image || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b21b?auto=format&fit=crop&q=80&w=800'} 
          alt="Task Area" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
           <div className="flex items-center gap-3 text-white/90">
              <MapPin className="h-4 w-4 text-blue-400" />
              <p className="text-xs font-bold leading-tight line-clamp-2 max-w-[80%]">{task.description}</p>
           </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8">
         <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Location Details</label>
            <div className="flex items-start gap-4 bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-3xl border border-transparent">
               <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-blue-600" />
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{task.description}</p>
                  <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Tap below to navigate</p>
               </div>
            </div>
            <Button 
               onClick={openInMaps}
               className="w-full h-14 bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 text-white rounded-2xl gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-zinc-900/20 transition-all active:scale-[0.98]"
            >
               <Navigation className="h-5 w-5" /> Start Navigation
            </Button>
         </div>

         <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Internal Description</label>
            <div className="p-5 border-l-2 border-blue-500 bg-blue-50/10 dark:bg-blue-900/5">
                <p className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold italic text-justify">
                   "AI Detected: {task.title}. Priority set based on user description. Please verify site conditions upon arrival."
                </p>
            </div>
         </div>

         {task.status === 'Completed' && (
           <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-4 animate-in zoom-in-95 duration-500">
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-sm font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">Task Completed</p>
                 <p className="text-[11px] text-emerald-700 dark:text-emerald-500/80 font-bold">The resolution has been logged to the system.</p>
              </div>
           </div>
         )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 left-6 right-6 z-40 lg:left-auto lg:right-auto lg:w-[400px]">
         {task.status === 'Pending' && (
           <Button 
             onClick={() => handleStatusUpdate('In Progress')}
             disabled={isUpdating}
             className="w-full h-16 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/40 gap-3 transition-all active:scale-[0.96]"
           >
             {isUpdating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Clock className="h-6 w-6" />}
             Accept & Start Task
           </Button>
         )}

         {task.status === 'In Progress' && (
           <div className="space-y-4">
              {proofPreview && (
                <div className="relative aspect-video rounded-[2rem] overflow-hidden border-2 border-blue-500 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
                   <img src={proofPreview} alt="Proof" className="w-full h-full object-cover" />
                   <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                      <CheckCircle2 className="h-5 w-5" />
                   </div>
                   <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-[10px] text-white font-black uppercase tracking-widest text-center">Work Evidence Captured</p>
                   </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <div className="flex gap-3">
                 <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 h-16 rounded-3xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 font-black uppercase tracking-widest text-[10px] gap-2.5 shadow-xl transition-all active:scale-[0.95]"
                 >
                    <Camera className="h-5 w-5" /> {proofPreview ? 'Retake' : 'Capture'}
                 </Button>
                 <Button 
                    onClick={() => handleStatusUpdate('Completed')}
                    disabled={isUpdating}
                    className="flex-[2.5] h-16 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/30 gap-3 transition-all active:scale-[0.95]"
                 >
                    {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                    Complete Task
                 </Button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
