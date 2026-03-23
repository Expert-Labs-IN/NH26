import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckSquare, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiEvent {
  id: string;
  email_id: string;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

interface ApiTask {
  id: string;
  email_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'urgent' | 'normal' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
}

const BASE = 'http://localhost:8000';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timeToGridOffset(dt: Date, startHour = 9): number {
  const h = dt.getHours();
  const m = dt.getMinutes();
  return ((h - startHour) + m / 60) * 96;
}

function durationPx(start: Date, end: Date): number {
  const diff = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
  return Math.max(diff * 96, 40);
}

function formatTime(dt: Date) {
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Parse due_date as local date to avoid UTC day shift
function parseDueDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/20 border-red-500/40 text-red-300',
  normal: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  low: 'bg-[#8083ff]/10 border-[#8083ff]/20 text-[#8083ff]',
};

const TASK_PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-400',
  normal: 'bg-blue-400',
  low: 'bg-[#8083ff]',
};

// Tasks use same color palette as events but always green to distinguish at a glance
const TASK_COLORS = [
  'bg-emerald-500/20 border-emerald-500/40',
  'bg-teal-500/20 border-teal-500/40',
  'bg-green-500/20 border-green-500/40',
];

const EVENT_COLORS = [
  'bg-violet-500/20 border-violet-500/40',
  'bg-cyan-500/20 border-cyan-500/40',
  'bg-emerald-500/20 border-emerald-500/40',
  'bg-amber-500/20 border-amber-500/40',
  'bg-pink-500/20 border-pink-500/40',
];

// Tasks with no time are pinned to 9 AM on their due date
const TASK_PINNED_HOUR = 9;
const TASK_HEIGHT_PX = 48;

// ─── Component ────────────────────────────────────────────────────────────────

export function Calendar() {
  const hours = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM – 5 PM

  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ type: 'event' | 'task'; id: string } | null>(null);

  const weekDates = getWeekDates(weekOffset);
  const monthLabel = MONTH_NAMES[weekDates[0].getMonth()];
  const weekLabel = `Week of ${weekDates[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${weekDates[4].toLocaleDateString([], { month: 'short', day: 'numeric' })}`;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [eventsRes, tasksRes] = await Promise.all([
          fetch(`${BASE}/api/events/?status=confirmed`),
          fetch(`${BASE}/api/tasks/`),
        ]);
        if (!eventsRes.ok) throw new Error('Failed to load events');
        if (!tasksRes.ok) throw new Error('Failed to load tasks');
        const eventsData: ApiEvent[] = await eventsRes.json();
        const tasksData: ApiTask[] = await tasksRes.json();
        setEvents(eventsData.filter(e => e.status === 'confirmed'));
        setTasks(tasksData.filter(t => t.status !== 'done'));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date();

  return (
    <div className="flex-1 flex h-full bg-[#0b1326] overflow-hidden">

      {/* ── Main Calendar ── */}
      <div className="flex-1 flex flex-col px-8 py-6 overflow-y-auto custom-scrollbar">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="display-lg text-[#dae2fd] tracking-tight">{monthLabel}</h1>
            <p className="body-md mt-1 font-medium text-[#c0c1ff]">{weekLabel}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[#131b2e] rounded-full p-1">
              <button
                onClick={() => setWeekOffset(o => o - 1)}
                className="p-2 rounded-full hover:bg-[#222a3d] text-[#c7c4d7] transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 text-sm font-semibold text-[#dae2fd] hover:text-white transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setWeekOffset(o => o + 1)}
                className="p-2 rounded-full hover:bg-[#222a3d] text-[#c7c4d7] transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <Button variant="primary" className="gap-2">
              <Plus size={16} /> New Event
            </Button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-[#908fa0] py-20">
            <Loader2 size={18} className="animate-spin" /> Loading calendar...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 py-20">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="flex mt-4 border-t border-[rgba(70,69,84,0.15)] pt-6 relative">

            {/* Time axis */}
            <div className="w-20 pr-4 flex flex-col flex-shrink-0">
              {hours.map(hour => (
                <div key={hour} className="h-24 text-right text-xs font-semibold text-[#908fa0] relative top-[-6px]">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            <div className="flex-1 grid grid-cols-5 gap-3 relative">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                {hours.map((_, i) => (
                  <div key={i} className="h-24 border-t border-[rgba(70,69,84,0.1)] w-full" />
                ))}
              </div>

              {weekDates.map((date, dIdx) => {
                const isToday = sameDay(date, today);

                const dayEvents = events.filter(evt =>
                  sameDay(new Date(evt.start_datetime), date)
                );

                const dayTasks = tasks.filter(t =>
                  t.due_date && sameDay(parseDueDate(t.due_date), date)
                );

                return (
                  <div key={dIdx} className="flex flex-col relative z-10">

                    {/* Day header */}
                    <div className="text-center mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#908fa0] block mb-1">
                        {DAY_NAMES[dIdx]}
                      </span>
                      <span className={`text-lg font-semibold inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        isToday ? 'text-white bg-[#8083ff]' : 'text-[#dae2fd]'
                      }`}>
                        {date.getDate()}
                      </span>
                    </div>

                    {/* Events + Tasks on grid */}
                    <div className="flex-1 relative">

                      {/* ── Events ── */}
                      {dayEvents.map((evt, evtIdx) => {
                        const start = new Date(evt.start_datetime);
                        const end = new Date(evt.end_datetime);
                        const top = timeToGridOffset(start);
                        const height = durationPx(start, end);
                        const colorClass = EVENT_COLORS[evtIdx % EVENT_COLORS.length];
                        const isHovered = tooltip?.type === 'event' && tooltip.id === evt.id;

                        return (
                          <div
                            key={evt.id}
                            className={`absolute w-[calc(100%-4px)] rounded-xl border p-2.5 cursor-pointer transition-all duration-200 ${colorClass} ${
                              isHovered ? 'shadow-xl scale-[1.03] z-30' : 'z-20 hover:scale-[1.02] hover:shadow-lg'
                            }`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            onMouseEnter={() => setTooltip({ type: 'event', id: evt.id })}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            <div className="font-semibold text-[12px] text-white leading-tight truncate">
                              {evt.title}
                            </div>
                            <div className="text-[11px] text-white/60 mt-0.5 flex items-center gap-1">
                              <Clock size={10} />
                              {formatTime(start)} – {formatTime(end)}
                            </div>
                            {evt.location && height > 60 && (
                              <div className="text-[11px] text-white/50 mt-0.5 flex items-center gap-1 truncate">
                                <MapPin size={10} className="shrink-0" />
                                {evt.location}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* ── Tasks pinned at 9 AM ── */}
                      {dayTasks.map((task, tIdx) => {
                        // Stack multiple tasks on same day by offsetting top slightly
                        const top = ((TASK_PINNED_HOUR - 9) * 96) + tIdx * (TASK_HEIGHT_PX + 4);
                        const colorClass = TASK_COLORS[tIdx % TASK_COLORS.length];
                        const isHovered = tooltip?.type === 'task' && tooltip.id === task.id;

                        return (
                          <div
                            key={task.id}
                            className={`absolute w-[calc(100%-4px)] rounded-xl border p-2.5 cursor-pointer transition-all duration-200 ${colorClass} ${
                              isHovered ? 'shadow-xl scale-[1.03] z-30' : 'z-20 hover:scale-[1.02] hover:shadow-lg'
                            }`}
                            style={{ top: `${top}px`, height: `${TASK_HEIGHT_PX}px` }}
                            onMouseEnter={() => setTooltip({ type: 'task', id: task.id })}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            <div className="flex items-center gap-1.5">
                              {/* Checkmark icon distinguishes tasks from events */}
                              <CheckSquare size={11} className="shrink-0 text-white/70" />
                              <div className="font-semibold text-[12px] text-white leading-tight truncate">
                                {task.title}
                              </div>
                            </div>
                            <div className="text-[11px] text-white/50 mt-0.5 pl-[19px]">
                              Due today
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Tasks Sidebar ── */}
      {!loading && !error && (
        <div className="w-72 flex-shrink-0 border-l border-[rgba(70,69,84,0.15)] bg-[#080f1e] px-5 py-6 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-6">
            <CheckSquare size={16} className="text-[#8083ff]" />
            <span className="font-semibold text-sm text-[#dae2fd] tracking-wide">Tasks</span>
            {tasks.length > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-[#8083ff]/20 text-[#8083ff] px-2 py-0.5 rounded-md border border-[#8083ff]/10 uppercase tracking-widest">
                {tasks.length}
              </span>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="text-[#464554] text-sm text-center py-8">No pending tasks.</div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="rounded-xl border border-white/5 bg-[#0d1628] p-4 hover:border-[#8083ff]/20 hover:bg-[#101c30] transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${TASK_PRIORITY_DOT[task.priority]}`} />
                    <span className="text-[13px] font-medium text-[#c7c4d7] group-hover:text-[#dae2fd] leading-snug transition-colors">
                      {task.title}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-[#464554] mt-2 leading-relaxed line-clamp-2 pl-4">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3 pl-4">
                    {task.due_date && (
                      <span className="text-[11px] text-[#908fa0] flex items-center gap-1">
                        <Clock size={10} />
                        {parseDueDate(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    <span className={`ml-auto text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="mt-2 pl-4">
                    <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                      task.status === 'in_progress'
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        : 'bg-white/5 text-[#908fa0] border-white/5'
                    }`}>
                      {task.status === 'in_progress' ? 'In progress' : 'To do'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}