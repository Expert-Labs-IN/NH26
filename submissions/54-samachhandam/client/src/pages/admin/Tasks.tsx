import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, Edit3, Trash2, Calendar, User } from "lucide-react";
import { cn } from "@/utils/cn";
import Modal from "@/components/ui/modal";
import { api } from "@/utils/api";
import type { ITask } from "@/@types/interface/task.interface";




export default function Tasks() {
  const [tasksData, setTasksData] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  
  const [newStatus, setNewStatus] = useState<string>("PENDING");
  const [actionLoading, setActionLoading] = useState(false);

  // Form state for creating task
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  });

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.task.getAllTasks();
      const data = response?.data || response;
      if (Array.isArray(data)) {
        setTasksData(data);
      } else {
        setTasksData([]);
      }
    } catch (error) {
      console.error("Error fetching admin tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.user.getAllDrivers();
      const data = response?.data || response;
      if (Array.isArray(data)) {
        setDrivers(data);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchDrivers();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasksData.filter(t => 
      (statusFilter === 'All' || t.status === statusFilter) &&
      (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [tasksData, statusFilter, searchTerm]);

  const paginatedTasks = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredTasks.slice(startIndex, startIndex + limit);
  }, [filteredTasks, page]);

  const totalPages = Math.ceil(filteredTasks.length / limit) || 1;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.task.createTask({
        ...formData,
        status: "PENDING"
      });
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.task.deleteTask(id);
      setTasksData(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTask) return;
    setActionLoading(true);
    try {
      await api.task.updateTaskStatus(selectedTask._id, newStatus);
      setIsUpdateModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task status", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Task Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Create, assign, and track waste collection tasks.</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-transparent focus:bg-white dark:focus:bg-zinc-800 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          {['All', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                statusFilter === filter 
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md" 
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {filter === 'All' ? 'All Tasks' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Task Details</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Assigned To</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold">Synchronizing tasks...</p>
                  </td>
                </tr>
              ) : paginatedTasks.length > 0 ? (
                paginatedTasks.map((task) => (
                  <tr key={task._id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-bold text-zinc-900 dark:text-white truncate">{task.title}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{task.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-blue-600" />
                         </div>
                         <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            {task.assignedTo.substring(0, 8)}...
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", getStatusColor(task.status))}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-8 w-8 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg shrink-0"
                           onClick={() => { setSelectedTask(task); setNewStatus(task.status); setIsUpdateModalOpen(true); }}
                           title="Update Status"
                         >
                           <Edit3 className="h-4 w-4" />
                         </Button>
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0"
                           onClick={() => handleDelete(task._id)}
                           title="Delete Task"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-zinc-400 font-bold">No tasks found in the database.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTasks.length > limit && (
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-800/10">
            <p className="text-xs text-zinc-500 font-bold">
              Showing <span className="text-zinc-900 dark:text-white">{(page-1)*limit + 1}-{Math.min(page*limit, filteredTasks.length)}</span> of <span className="text-zinc-900 dark:text-white">{filteredTasks.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 text-zinc-500" />
              </Button>
              <div className="flex items-center gap-1 mx-2">
                 {[...Array(totalPages)].map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setPage(i + 1)}
                     className={cn(
                        "w-7 h-7 rounded-lg text-xs font-bold transition-all",
                        page === i + 1 
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                     )}
                   >
                     {i + 1}
                   </button>
                 ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => !actionLoading && setIsCreateModalOpen(false)} 
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Title</label>
            <Input 
               required
               placeholder="Task title (e.g. Hazardous waste collection)" 
               className="rounded-xl h-11 bg-zinc-50/50 border-zinc-200 dark:border-zinc-800"
               value={formData.title}
               onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Description</label>
             <textarea 
               required
               placeholder="Detailed instructions for the driver..." 
               className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 dark:border-zinc-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px]"
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Assign Driver</label>
                <select 
                  required
                  className="w-full rounded-xl bg-zinc-50/50 border border-zinc-200 dark:border-zinc-800 h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                >
                  <option value="">Select a driver...</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                  ))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Due Date</label>
                <Input 
                   required
                   type="date"
                   className="rounded-xl h-11 bg-zinc-50/50 border-zinc-200 dark:border-zinc-800"
                   value={formData.dueDate}
                   onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
             </div>
          </div>
          
          <div className="pt-4 flex gap-3">
             <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setIsCreateModalOpen(false)} disabled={actionLoading}>Cancel</Button>
             <Button type="submit" className="flex-1 rounded-xl h-11 bg-zinc-900 dark:bg-white dark:text-zinc-900" disabled={actionLoading}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dispatch Task"}
             </Button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => !actionLoading && setIsUpdateModalOpen(false)}
        title="Update Task Status"
      >
        <div className="space-y-6">
          <p className="text-sm text-zinc-500">
             Update current progress for: <span className="font-bold text-zinc-900 dark:text-white">"{selectedTask?.title}"</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
             {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                <Button
                  key={status}
                  variant={newStatus === status ? "default" : "outline"}
                  onClick={() => setNewStatus(status)}
                  className={cn(
                    "h-12 w-full justify-start px-4 font-bold border-zinc-200 dark:border-zinc-800",
                    newStatus === status ? "bg-blue-600 text-white border-transparent" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-blue-500/50"
                  )}
                >
                  {status}
                </Button>
             ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
             <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)} disabled={actionLoading}>Cancel</Button>
             <Button onClick={handleUpdateStatus} disabled={actionLoading} className="bg-blue-600 text-white min-w-[120px]">
               {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
             </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
