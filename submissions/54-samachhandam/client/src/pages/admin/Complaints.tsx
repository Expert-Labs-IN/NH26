import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, MapPin, Loader2, ChevronLeft, ChevronRight, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import Modal from "@/components/ui/modal";
import { api } from "@/utils/api";
import type IComplain from "@/@types/interface/complain.interface";

export default function Complaints() {
  const [complaintsData, setComplaintsData] = useState<IComplain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  
  const [newStatus, setNewStatus] = useState("Pending");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const response = await api.complain.getAllComplains();
      let data = response?.data?.complains || response?.data || [];
      
      // DUMMY DATA FALLBACK (Demo mode)
      if (data.length === 0) {
        data = [
          { _id: 'c1', description: 'Large trash pile on 5th Ave', status: 'Pending', complained_by: 'john@example.com', coordinates: { latitude: 40.7128, longitude: -74.0060 } },
          { _id: 'c2', description: 'Broken recycling bin at Central Park', status: 'Assigned', complained_by: 'sarah@example.com', coordinates: { latitude: 40.7829, longitude: -73.9654 } },
          { _id: 'c3', description: 'Illegal dumping in Sector 4', status: 'Resolved', complained_by: 'mike@example.com', coordinates: { latitude: 40.7484, longitude: -73.9857 } },
          { _id: 'c4', description: 'Overflowing public bin near subway', status: 'Pending', complained_by: 'anna@example.com', coordinates: { latitude: 40.7589, longitude: -73.9851 } }
        ];
      }
      
      setComplaintsData(data);
    } catch (error) {
      console.error("Error fetching admin complaints:", error);
      // Fallback on error
      setComplaintsData([
          { _id: 'c1', description: 'Demo: Waste report on Wall St', status: 'Pending', complained_by: 'demo@user.com', coordinates: { latitude: 40.7075, longitude: -74.0113 } }
      ] as any);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.user.getAllDrivers();
      let data = response?.data || response;
      
      // DUMMY DRIVERS FALLBACK
      if (!Array.isArray(data) || data.length === 0) {
        data = [
          { _id: 'd1', name: 'Robert Fox', email: 'robert@driver.com' },
          { _id: 'd2', name: 'Jane Cooper', email: 'jane@driver.com' },
          { _id: 'd3', name: 'Cody Fisher', email: 'cody@driver.com' }
        ];
      }
      
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([{ _id: 'd1', name: 'Demo Driver', email: 'demo@driver.com' }]);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchDrivers();
  }, []);

  const filteredComplaints = useMemo(() => {
    return complaintsData.filter(c => 
      (statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase()) &&
      (c.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (typeof c.complained_by === 'object' && c.complained_by !== null && (c.complained_by as any).email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (typeof c.complained_by === 'string' && (c.complained_by as string).toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [complaintsData, statusFilter, searchTerm]);

  const paginatedComplaints = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredComplaints.slice(startIndex, startIndex + limit);
  }, [filteredComplaints, page]);

  const totalPages = Math.ceil(filteredComplaints.length / limit) || 1;

  const handleAssignClick = (complaint: any) => {
    setSelectedComplaint(complaint);
    setIsAssignModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      if (id.startsWith('c')) {
        alert("Demo: Complaint removed locally");
        setComplaintsData(prev => prev.filter(c => c._id !== id));
      } else {
        await api.complain.deleteComplain(id);
        alert("Complaint deleted successfully!");
        setComplaintsData(prev => prev.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete complaint", error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;
    setActionLoading(true);
    try {
      if (selectedComplaint._id.startsWith('c')) {
         setComplaintsData(prev => prev.map(c => c._id === selectedComplaint._id ? { ...c, status: newStatus as any } : c));
         alert(`Demo: Status updated to ${newStatus.toUpperCase()} locally`);
      } else {
        await api.complain.updateComplainStatus(selectedComplaint._id, newStatus);
        alert(`Status updated to ${newStatus.toUpperCase()} successfully!`);
        fetchComplaints();
      }
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSubmit = async (driverId: string) => {
    if (!selectedComplaint) return;
    setActionLoading(true);
    try {
      if (selectedComplaint._id.startsWith('c')) {
         setComplaintsData(prev => prev.map(c => c._id === selectedComplaint._id ? { ...c, status: 'Assigned' } : c));
         alert("Demo: Driver assigned locally!");
      } else {
        await api.task.createTask({
          title: `Clear Waste: ${(selectedComplaint.description || '').substring(0, 30)}`,
          description: selectedComplaint.description,
          imageUrl: selectedComplaint.imageUrl || '',
          assignedTo: driverId,
          priority: "Normal",
          status: "Pending",
          dueDate: new Date(Date.now() + 86400000)
        });
        await api.complain.updateComplainStatus(selectedComplaint._id, "Assigned");
        alert("Driver assigned successfully!");
        fetchComplaints();
      }
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error("Failed to assign driver and create task:", error);
      alert("Failed to assign driver.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'assigned': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Complaints</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage and assign waste collection reports.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
           <span className="font-semibold text-blue-600">{filteredComplaints.length}</span> Total Records
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search by user or location..." 
            className="pl-10 h-11 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          {['All', 'Pending', 'Assigned', 'In Progress', 'Resolved'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-full px-4 h-9 transition-all whitespace-nowrap",
                statusFilter === status 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              )}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Waste Type</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                       <span className="text-zinc-500 font-bold">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedComplaints.length > 0 ? (
                paginatedComplaints.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="Complaint" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                              <Search className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-white truncate max-w-[150px] font-bold uppercase tracking-tight">{item.description}</div>
                          <div className="text-[10px] text-zinc-500 font-medium truncate max-w-[150px] uppercase tracking-widest">
                            Reported by: {typeof item.complained_by === 'object' && item.complained_by !== null ? (item.complained_by as any).email : (item.complained_by ? String(item.complained_by).substring(0, 8) : 'Anonymous')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        {item.coordinates ? (
                          <>
                            {item.coordinates.coordinates 
                              ? `${item.coordinates.coordinates[1]?.toFixed(4)}, ${item.coordinates.coordinates[0]?.toFixed(4)}`
                              : `${(item.coordinates as any).latitude?.toFixed(4)}, ${(item.coordinates as any).longitude?.toFixed(4)}`
                            }
                          </>
                        ) : "Location Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase text-[10px] font-black tracking-widest text-zinc-400">
                      Waste Type
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                        getStatusColor(item.status || 'Pending')
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex items-center justify-end gap-1">
                         {item.status.toLowerCase() === 'pending' && (
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg shrink-0"
                             onClick={() => handleAssignClick(item)}
                             title="Assign Driver"
                           >
                             <UserPlus className="h-4 w-4" />
                           </Button>
                         )}
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-8 w-8 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg shrink-0"
                           onClick={() => { setSelectedComplaint(item); setNewStatus(item.status); setIsStatusModalOpen(true); }}
                           title="Update Status"
                         >
                           <Edit3 className="h-4 w-4" />
                         </Button>
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0"
                             onClick={() => handleDelete(item._id!)}
                             title="Delete Complaint"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                      No complaints found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 flex items-center justify-between">
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
             Record Count: {filteredComplaints.length}
           </p>
           <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || filteredComplaints.length === 0}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
           </div>
        </div>
      </div>

      {/* Driver Assignment Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        title="Assign Driver"
      >
        <div className="space-y-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 mb-6">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Complaint for</p>
                   <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{selectedComplaint?.description?.substring(0, 40) || 'Issue'}</h4>
                </div>
                <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2 rounded-full uppercase text-[10px]">{selectedComplaint?.status}</Badge>
             </div>
          </div>

          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Select Available Driver</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {drivers.map(driver => (
              <div 
                key={driver._id} 
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 group-hover:text-blue-600 uppercase border border-zinc-200 dark:border-zinc-700">
                    {driver.name ? driver.name.charAt(0) : 'D'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{driver.name}</p>
                    <p className="text-[10px] text-zinc-500 font-medium lowercase italic">{driver.email}</p>
                  </div>
                </div>
                <Button 
                   size="sm" 
                   variant="outline" 
                   className="h-8 rounded-lg group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors uppercase font-bold text-[10px] tracking-widest"
                   onClick={() => handleAssignSubmit(driver._id)}
                   disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest border-zinc-200 dark:border-zinc-800" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-xl h-11 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest" onClick={() => setIsAssignModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => !actionLoading && setIsStatusModalOpen(false)}
        title="Update Status"
      >
        <div className="space-y-6 text-left">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
             Status Change Protocol
          </p>
          <div className="grid grid-cols-2 gap-3">
             {['Pending', 'Assigned', 'Resolved', 'Rejected'].map(status => (
                <Button
                  key={status}
                  variant={newStatus === status ? "default" : "outline"}
                  onClick={() => setNewStatus(status)}
                  className={cn(
                    "h-12 w-full justify-start px-4 font-bold border-zinc-200 dark:border-zinc-800 rounded-xl uppercase tracking-widest text-[10px]",
                    newStatus === status ? "bg-blue-600 text-white border-transparent" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-blue-500/50"
                  )}
                >
                   {status}
                </Button>
             ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
             <Button variant="outline" onClick={() => setIsStatusModalOpen(false)} disabled={actionLoading} className="rounded-xl px-6 uppercase font-bold text-[10px] tracking-widest border-zinc-200 dark:border-zinc-800 h-10">Cancel</Button>
             <Button onClick={handleUpdateStatus} disabled={actionLoading} className="bg-blue-600 text-white min-w-[120px] rounded-xl px-6 uppercase font-bold text-[10px] tracking-widest h-10 shadow-lg shadow-blue-500/20">
               {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Change"}
             </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
