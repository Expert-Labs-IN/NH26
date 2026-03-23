import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Navigation, Map as MapIcon, ChevronRight, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { api } from "@/utils/api";

export default function WorkerPendingRequests() {
  const navigate = useNavigate();
  const [availableComplains, setAvailableComplains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.complain.getComplainsByFilter({ status: 'Pending' });
      let data = response.success ? (response.data.complains || response.data || []) : [];
      
      // DUMMY DATA FALLBACK
      if (data.length === 0) {
        data = [
          { _id: 'c1', title: 'Overflowing Bin', description: 'Park Avenue, near entrance', status: 'Pending', priority: 'High', area: 'Downtown' },
          { _id: 'c2', title: 'Industrial Spill', description: 'Industrial Zone B4', status: 'Pending', priority: 'Critical', area: 'East Port' },
          { _id: 'c3', title: 'Illegal Dumping', description: 'Forest Edge Rd', status: 'Pending', priority: 'Normal', area: 'North Hills' }
        ];
      }
      setAvailableComplains(data);
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
      setAvailableComplains([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleAccept = async (complainId: string) => {
    if (!window.confirm("Accept this service request?")) return;
    try {
      if (complainId.startsWith('c')) {
        alert("Demo: Request accepted!");
        setAvailableComplains(prev => prev.filter(c => c._id !== complainId));
        return;
      }
      const now = new Date();
      const response = await api.complain.acceptComplain(complainId, now);
      if (response.success) {
        alert("Request accepted!");
        fetchPendingRequests();
      }
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleAcceptAll = async () => {
    if (!window.confirm(`Accept all ${availableComplains.length} pending requests?`)) return;
    setActionLoading(true);
    try {
      // For demo mode, we just clear the list
      const hasDummy = availableComplains.some(c => c._id.startsWith('c'));
      if (hasDummy) {
        alert("Demo: All available requests accepted!");
        setAvailableComplains([]);
      } else {
        // Real implementation would loop or have a bulk API
        for (const req of availableComplains) {
          await api.complain.acceptComplain(req._id, new Date());
        }
        alert("All requests accepted successfully!");
        fetchPendingRequests();
      }
    } catch (error) {
      console.error("Failed to accept all requests:", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Pending Requests</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 text-sm uppercase tracking-wider font-medium">Available service calls in your vicinity</p>
          </div>
        </div>
        
        {availableComplains.length > 0 && (
          <button 
            onClick={handleAcceptAll}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Approve All
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-zinc-500 font-medium text-xs tracking-widest uppercase animate-pulse">Scanning Grid...</p>
        </div>
      ) : availableComplains.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableComplains.map((request) => (
            <div 
              key={request._id} 
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border",
                    request.priority === 'Critical' ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20" :
                    "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20"
                  )}>
                    {request.priority || 'Normal'}
                  </span>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">
                    {request.title || 'Service Call'}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                  <MapIcon className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                 <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <Navigation className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{request.description}</span>
                 </div>
                 {request.area && (
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{request.area}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleAccept(request._id)}
                className="w-full h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm uppercase tracking-wider hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all flex items-center justify-center gap-2 group"
              >
                Accept Request
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-20 text-center">
          <div className="h-16 w-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ClipboardList className="h-8 w-8 text-zinc-300" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white uppercase tracking-tight mb-1">Radar Clear</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-8 text-sm font-medium">
            No pending requests found. Check back later for new assignments.
          </p>
          <button 
            onClick={fetchPendingRequests}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          >
            Refresh Grid
          </button>
        </div>
      )}
    </div>
  );
}
