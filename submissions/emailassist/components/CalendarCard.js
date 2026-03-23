"use client";

import { useState, useTransition } from "react";
import { createCalendarEvent } from "@/actions/createCalendarEvent";

export default function CalendarCard({ email, onUpdate }) {
  const [eventData, setEventData] = useState({
    title: email.calendarEvent?.title || "",
    date: email.calendarEvent?.date || "",
    time: email.calendarEvent?.time || "",
    description: email.calendarEvent?.description || "",
    participants: email.calendarEvent?.participants || [],
  });
  const [created, setCreated] = useState(email.calendarCreated);
  const [isPending, startCreate] = useTransition();
  const [error, setError] = useState("");

  function handleChange(field, value) {
    setEventData((prev) => ({ ...prev, [field]: value }));
  }

  function handleCreateEvent() {
    if (created) return;
    startCreate(async () => {
      try {
        setError("");
        await createCalendarEvent({ emailId: email.emailId, eventData });
        setCreated(true);
        if (onUpdate) onUpdate({ ...email, calendarCreated: true });
      } catch (err) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Calendar Event</h3>
      </div>

      <div className="space-y-3">
        {/* Event title */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Event Title</label>
          <input
            type="text"
            value={eventData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date</label>
            <input
              type="date"
              value={eventData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Time</label>
            <input
              type="time"
              value={eventData.time}
              onChange={(e) => handleChange("time", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Description</label>
          <textarea
            value={eventData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 resize-none focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Participants */}
        {eventData.participants.length > 0 && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Participants</label>
            <div className="flex flex-wrap gap-1.5">
              {eventData.participants.map((p) => (
                <span key={p} className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

      <button
        onClick={handleCreateEvent}
        disabled={isPending || created || !eventData.date}
        className={`mt-4 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
          created
            ? "bg-green-600/20 text-green-400 border border-green-600/30 cursor-default"
            : "bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
        }`}
      >
        {created ? (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Event Created
          </>
        ) : isPending ? (
          "Creating…"
        ) : (
          "Create Event"
        )}
      </button>
    </div>
  );
}
