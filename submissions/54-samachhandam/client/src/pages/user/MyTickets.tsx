import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, MapPin, ChevronRight, AlertCircle, Loader2, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import type IComplain from "@/@types/interface/complain.interface";
import { cn } from "@/utils/cn";

export default function MyTickets() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<IComplain[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const fetchTickets = useCallback(async () => {
    if (!user?._id) return;

    setIsLoading(true);
    try {
      const response = await api.complain.getComplainsByUserId(user._id) as {
        data?: { complains?: IComplain[] }
      };

      const data = response?.data?.complains ?? [];

      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = tickets.filter((t) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (t.description ?? '').toLowerCase().includes(search) ||
      (t.title ?? '').toLowerCase().includes(search) ||
      (t._id ?? '').toLowerCase().includes(search);

    const matchesFilter =
      activeFilter === 'all' ||
      (t.status ?? '').toLowerCase() === activeFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const handleStartChat = async () => {
    try {
      const res = await api.chat.createSession();
      if (res?.success) {
        navigate(`/chat/${res.data.session_id}`);
      }
    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'assigned':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'resolved':
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-zinc-50 text-zinc-500 border-zinc-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            My Complaints
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            History of all issues reported by you.
          </p>
        </div>

        <div className="relative group w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search by title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <Filter size={14} className="text-zinc-500" />
        </div>

        {['all', 'pending', 'assigned', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border",
              activeFilter === f
                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white border-zinc-200 text-zinc-500 hover:border-blue-400 dark:bg-zinc-900 dark:border-zinc-800"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
          <p className="text-xs font-bold text-zinc-400 uppercase">
            Loading...
          </p>
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => navigate(`/reports/${ticket._id}`)}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border hover:border-blue-500 cursor-pointer transition-all"
            >
              <div className="flex justify-between mb-4">
                <span className={cn("px-2 py-1 text-xs rounded", getStatusColor(ticket.status))}>
                  {ticket.status}
                </span>
                <ChevronRight size={16} />
              </div>

              <h3 className="font-bold text-sm mb-1">
                {ticket.title || "Complaint"}
              </h3>

              <p className="text-xs text-zinc-500 mb-4">
                {ticket.description}
              </p>

              <div className="flex justify-between text-xs text-zinc-500">
                <span>
                  <Calendar size={12} />{" "}
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
                <span>
                  <MapPin size={12} /> {ticket.city || "Local"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <AlertCircle size={32} className="mx-auto text-zinc-400 mb-4" />
          <p>No complaints found</p>

          <button
            onClick={handleStartChat}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl"
          >
            Create Complaint
          </button>
        </div>
      )}
    </div>
  );
}