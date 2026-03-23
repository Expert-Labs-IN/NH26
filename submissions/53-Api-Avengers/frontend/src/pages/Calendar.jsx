import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalIcon, 
  Settings, 
  Search, 
  CalendarDays, 
  Clock, 
  User, 
  MapPin, 
  Play,
  CheckCircle2,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { calendarService, emailService } from '../services/api';

const EventCard = ({ event }) => (
  <div className="glass-card p-4 flex gap-4 hover:scale-[1.01] active:scale-[0.99] transition-transform">
    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex flex-col items-center justify-center border border-secondary/20 shrink-0">
      <span className="text-[10px] uppercase font-bold text-secondary formular-mono">Mar</span>
      <span className="text-lg font-bold text-white">25</span>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-white truncate mb-2">{event.summary || 'Untitled Meeting'}</h3>
      <div className="grid grid-cols-2 gap-y-2">
        <div className="flex items-center gap-2 text-white/40">
          <Clock className="w-3 h-3" />
          <span className="text-[10px] formular-mono">14:30 - 16:00</span>
        </div>
        <div className="flex items-center gap-2 text-white/40">
          <User className="w-3 h-3" />
          <span className="text-[10px] truncate">Priya Sharma</span>
        </div>
        <div className="flex items-center gap-2 text-white/40 col-span-2">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px] truncate">Conf Room B, Floor 3</span>
        </div>
      </div>
    </div>
    <button className="self-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors">
      <Settings className="w-4 h-4" />
    </button>
  </div>
);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const { data } = await calendarService.scanEvents();
      setScanResults(data);
    } catch (err) {
      console.error("Scan failed", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8 h-full">
      {/* Left Content - Upcoming Events */}
      <div className="col-span-7 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Your Schedule</h2>
            <div className="bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded border border-secondary/20">GMT +5:30</div>
          </div>
          <button className="text-sm text-secondary hover:underline flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            View Full Calendar
          </button>
        </div>

        <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2">
          {events.length > 0 ? (
            events.map((e, idx) => <EventCard key={idx} event={e} />)
          ) : (
            <>
              <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">Upcoming</div>
              <EventCard event={{ summary: 'Q2 Product Roadmap Review' }} />
              <EventCard event={{ summary: 'NexMail x CloudBase Kickoff' }} />
              <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] my-8">Tomorrow</div>
              <EventCard event={{ summary: 'Lunch & Learn: Agentic AI' }} />
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar - AI Scan */}
      <div className="col-span-5 flex flex-col gap-6">
        <div className="glass-panel p-6 bg-glow-conic/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 scale-150 opacity-10 pointer-events-none">
            <Sparkles className="w-24 h-24 text-secondary" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              AI Event Discovery
            </h3>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              Scan your untriaged emails to automatically detect and schedule upcoming meetings.
            </p>

            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="w-full btn-primary flex items-center justify-center gap-3 py-3"
            >
              {isScanning ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  Analyzing Inbox...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" fill="currentColor" />
                  Scan Emails for Events
                </>
              )}
            </button>
          </div>
        </div>

        {scanResults && (
          <div className="glass-panel p-6 animate-in slide-in-from-right-8 duration-500">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Scan Results</h4>
            {scanResults.emails?.length > 0 ? (
              <div className="space-y-3">
                {scanResults.emails.map(em => (
                  <div key={em.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-sm font-medium mb-1 truncate">{em.subject}</div>
                    <div className="text-[10px] text-white/30 truncate mb-3">{em.sender}</div>
                    <button className="w-full py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs rounded-lg transition-colors border border-secondary/10 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Add to Calendar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-sm text-white/30 italic">No new events detected.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
