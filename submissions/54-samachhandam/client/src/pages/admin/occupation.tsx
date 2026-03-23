import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Modal from '@/components/ui/modal';
import { 
  Briefcase, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Search
} from 'lucide-react';
import type { IOcupation } from '@/@types/interface/occupation.interface';

export default function Occupation() {
  const [occupations, setOccupations] = useState<IOcupation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOccupation, setEditingOccupation] = useState<IOcupation | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchOccupations = async () => {
    setIsLoading(true);
    try {
      const response = await api.occupation.getAllOccupations();
      let data = response.data || [];
      
      // DUMMY DATA FALLBACK (Demo mode)
      if (data.length === 0) {
        data = [
          { _id: 'o1', name: 'Waste Collector', description: 'Specializes in residential and commercial waste collection and disposal.' },
          { _id: 'o2', name: 'Recycling Specialist', description: 'Expert in sorting and processing recyclable materials for sustainable reuse.' },
          { _id: 'o3', name: 'Sanitation Engineer', description: 'Focuses on the maintenance and optimization of urban sanitation systems.' },
          { _id: 'o4', name: 'Industrial Cleaner', description: 'Large-scale cleaning services for factories, warehouses, and construction sites.' }
        ];
      }
      
      setOccupations(data);
    } catch (error: any) {
      console.error("Error fetching occupations:", error);
      // Fallback to dummy data even on error for demo purposes
      setOccupations([
          { _id: 'o1', name: 'Waste Collector (Demo)', description: 'Specializes in residential and commercial waste collection and disposal.' },
          { _id: 'o2', name: 'Recycling Specialist (Demo)', description: 'Expert in sorting and processing recyclable materials for sustainable reuse.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupations();
  }, []);

  const handleOpenModal = (occupation?: IOcupation) => {
    if (occupation) {
      setEditingOccupation(occupation);
      setFormData({ name: occupation.name, description: occupation.description });
    } else {
      setEditingOccupation(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
    setMessage(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOccupation(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (editingOccupation?._id) {
        if (editingOccupation._id.startsWith('o')) { // Dummy handling
           setOccupations(prev => prev.map(o => o._id === editingOccupation._id ? { ...o, ...formData } : o));
           setMessage({ type: 'success', text: "Demo: Occupation updated locally" });
        } else {
          await api.occupation.updateOccupation(editingOccupation._id, formData);
          setMessage({ type: 'success', text: "Occupation updated successfully" });
          fetchOccupations();
        }
      } else {
        const newId = 'o' + Date.now();
        setOccupations(prev => [...prev, { _id: newId, ...formData } as any]);
        setMessage({ type: 'success', text: "Demo: Occupation added locally" });
      }
      setTimeout(handleCloseModal, 1500);
    } catch (error: any) {
      console.error("Error saving occupation:", error);
      setMessage({ type: 'error', text: error.response?.data?.message || "Failed to save occupation" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this occupation?")) return;
    
    try {
      if (id.startsWith('o')) { // Dummy handling
        setOccupations(prev => prev.filter(o => o._id !== id));
        setMessage({ type: 'success', text: "Demo: Occupation removed locally" });
      } else {
        await api.occupation.deleteOccupation(id);
        setMessage({ type: 'success', text: "Occupation deleted successfully" });
        setOccupations(prev => prev.filter(o => o._id !== id));
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Error deleting occupation:", error);
      setMessage({ type: 'error', text: error.response?.data?.message || "Failed to delete occupation" });
    }
  };

  const filteredOccupations = occupations.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.description && o.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            Occupation Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Define and manage the work categories for your service workers.
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Occupation
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
        <Input 
          type="text" 
          placeholder="Search occupations..." 
          className="pl-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 rounded-xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {message && !isModalOpen && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' 
            ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' 
            : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Loading occupations...</p>
        </div>
      ) : filteredOccupations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOccupations.map((occupation) => (
            <div 
              key={occupation._id} 
              className="group relative bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => handleOpenModal(occupation)}
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => occupation._id && handleDelete(occupation._id)}
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                {occupation.name}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
                {occupation.description}
              </p>

              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  System Role
                </span>
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase">
                  Service Provider
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-20 text-center">
          <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-10 w-10 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Occupations Found</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-8">
            You haven't defined any work categories yet. Start by creating the first occupation for your workers.
          </p>
          <Button onClick={() => handleOpenModal()} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create First Occupation
          </Button>
        </div>
      )}

      {/* Occupation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingOccupation ? "Edit Occupation" : "Add New Occupation"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && isModalOpen && (
            <div className={`p-4 rounded-xl flex items-center gap-3 border ${
              message.type === 'success' 
                ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' 
                : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Occupation Name</label>
            <Input 
              required
              placeholder="e.g. Electrician, Plumber, Waste Collector"
              className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/20"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Description</label>
            <Textarea 
              required
              placeholder="Provide a brief description of the services provided by this occupation..."
              className="min-h-[120px] bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-blue-500/20"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-xl"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingOccupation ? "Update Occupation" : "Add Occupation"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
