"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { createCalendarEvent } from "@/actions/createCalendarEvent";

// --- Helpers ---
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return "No date set";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

function isSameDay(dateStr, year, month, day) {
  const d = parseLocalDate(dateStr);
  if (!d) return false;
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Priority color for event pills
const PILL_COLORS = [
  "bg-blue-600","bg-purple-600","bg-emerald-600","bg-orange-600","bg-pink-600","bg-indigo-600",
];

export default function CalendarClient({ events, userName }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState(
    new Set(events.filter((e) => e.calendarCreated).map((e) => e.id))
  );

  // Build calendar grid for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  // Events for current month
  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = parseLocalDate(e.date);
      return d && d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });
  }, [events, viewYear, viewMonth]);

  // Upcoming events — next 30 days from today
  const upcomingEvents = useMemo(() => {
    const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const thirtyDaysMs = todayMs + 30 * 24 * 60 * 60 * 1000;
    return events
      .filter((e) => {
        const d = parseLocalDate(e.date);
        if (!d) return false;
        const ms = d.getTime();
        return ms >= todayMs && ms <= thirtyDaysMs;
      })
      .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
  }, [events]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  async function handleAddToCalendar(event) {
    setAddingId(event.id);
    try {
      await createCalendarEvent(event.emailId);
      setAddedIds((prev) => new Set([...prev, event.id]));
      if (selectedEvent?.id === event.id) {
        setSelectedEvent({ ...selectedEvent, calendarCreated: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingId(null);
    }
  }

  const isToday = (day) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400 text-sm mt-1">
            {events.length === 0
              ? "No meeting events found. Process emails to extract meetings."
              : `${events.length} meeting${events.length !== 1 ? "s" : ""} extracted from emails`}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* --- LEFT: Calendar Grid (2/3 width) --- */}
          <div className="xl:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Month navigation */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-800">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-3">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const dayEvents = day
                    ? monthEvents.filter((e) => isSameDay(e.date, viewYear, viewMonth, day))
                    : [];
                  return (
                    <div
                      key={idx}
                      className={`min-h-[90px] border-b border-r border-gray-800/50 p-1.5 ${
                        !day ? "bg-gray-900/30" : "hover:bg-gray-800/30 transition-colors"
                      }`}
                    >
                      {day && (
                        <>
                          <span
                            className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                              isToday(day)
                                ? "bg-blue-600 text-white"
                                : "text-gray-400"
                            }`}
                          >
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {dayEvents.slice(0, 3).map((e, i) => (
                              <button
                                key={e.id}
                                onClick={() => setSelectedEvent(e)}
                                className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate ${
                                  PILL_COLORS[i % PILL_COLORS.length]
                                } text-white hover:opacity-80 transition-opacity`}
                              >
                                {e.time && <span className="opacity-75 mr-1">{e.time}</span>}
                                {e.title}
                              </button>
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-xs text-gray-500 px-1">
                                +{dayEvents.length - 3} more
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* --- RIGHT: Upcoming Events Sidebar (1/3 width) --- */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upcoming (next 30 days)
              </h3>

              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No upcoming meetings in the next 30 days.</p>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {upcomingEvents.map((e, i) => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEvent(e)}
                      className="w-full text-left p-3 rounded-lg bg-gray-800/60 hover:bg-gray-800 transition-colors border border-gray-700/50 hover:border-gray-600"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${PILL_COLORS[i % PILL_COLORS.length]}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{e.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(e.date)}{e.time ? ` · ${e.time}` : ""}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            From: {e.sourceSubject}
                          </p>
                          <span className={`inline-flex items-center gap-1 text-xs mt-1 ${
                            addedIds.has(e.id) ? "text-emerald-400" : "text-yellow-500"
                          }`}>
                            {addedIds.has(e.id) ? "✓ In Google Calendar" : "⏳ Not added yet"}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stats card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total meetings</span>
                  <span className="text-white font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Added to Google Cal</span>
                  <span className="text-emerald-400 font-medium">{addedIds.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pending</span>
                  <span className="text-yellow-500 font-medium">{events.length - addedIds.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Upcoming (30d)</span>
                  <span className="text-blue-400 font-medium">{upcomingEvents.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Event Detail Modal --- */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedEvent(null); }}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{selectedEvent.title}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {formatDate(selectedEvent.date)}
                  {selectedEvent.time && <span> · {selectedEvent.time}</span>}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-white transition-colors ml-4 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* Participants */}
              {selectedEvent.participants?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Participants</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.participants.map((p, i) => (
                      <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}

              {/* Source email */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Source Email</p>
                <p className="text-sm text-gray-300 italic">{'"'}{selectedEvent.sourceSubject}{'"'}</p>
                <p className="text-xs text-gray-500 mt-0.5">from {selectedEvent.sourceSender}</p>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                addedIds.has(selectedEvent.id)
                  ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50"
                  : "bg-yellow-900/20 text-yellow-500 border border-yellow-800/30"
              }`}>
                {addedIds.has(selectedEvent.id) ? (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Google Calendar
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Not yet added to Google Calendar
                  </>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-5 pb-5 flex gap-2">
              {!addedIds.has(selectedEvent.id) && (
                <button
                  onClick={() => handleAddToCalendar(selectedEvent)}
                  disabled={addingId === selectedEvent.id}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {addingId === selectedEvent.id ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Adding…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Add to Google Calendar
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
