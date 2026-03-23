import { useState, useTransition } from "react";
import { createCalendarEvent } from "@/actions/createCalendarEvent";
import { Calendar, CheckCircle2, Video, Users, Clock, AlertTriangle } from "lucide-react";

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

  const inputClasses = "w-full bg-gray-50 rounded-lg px-5 py-4 text-base text-[#211B34] font-bold focus:outline-none focus:ring-2 focus:ring-[#211B34]/5 focus:bg-white transition-all placeholder:text-[#211B34]/20";
  const labelClasses = "text-[10px] uppercase tracking-widest font-black text-[#211B34]/30 mb-2 ml-1";

  return (
    <div className="bg-white rounded-xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED]">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-black text-[#211B34]/30 uppercase tracking-[0.2em]">Schedule</h3>
          <p className="text-[#211B34] font-bold text-lg">Calendar Event</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Event title */}
        <div className="group">
          <label className={labelClasses}>Event Title</label>
          <input
            type="text"
            value={eventData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={inputClasses}
            placeholder="What's the goal?"
          />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-6">
          <div className="group">
            <label className={labelClasses}>Date</label>
            <div className="relative">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#211B34]/40" />
              <input
                type="date"
                value={eventData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={`${inputClasses} pl-12`}
              />
            </div>
          </div>
          <div className="group">
            <label className={labelClasses}>Time</label>
            <div className="relative">
              <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#211B34]/40" />
              <input
                type="time"
                value={eventData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className={`${inputClasses} pl-12`}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="group">
          <label className={labelClasses}>Details</label>
          <div className="relative">
            <Video className="absolute left-5 top-5 w-4 h-4 text-[#211B34]/40" />
            <textarea
              value={eventData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className={`${inputClasses} pl-12 resize-none`}
              placeholder="Add some context..."
            />
          </div>
        </div>

        {/* Participants */}
        {eventData.participants.length > 0 && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
            <label className={labelClasses}>Participants</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {eventData.participants.map((p) => (
                <div key={p} className="flex items-center gap-2 text-xs bg-[#7C3AED]/10 text-[#7C3AED] px-4 py-2 rounded-lg font-bold">
                  <Users className="w-3.5 h-3.5" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mt-8 bg-red-50 text-red-600 rounded-lg text-sm font-bold animate-shake">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        onClick={handleCreateEvent}
        disabled={isPending || created || !eventData.date}
        className={`mt-10 w-full flex items-center justify-center gap-3 py-4 rounded-lg text-base font-black transition-all duration-300 active:scale-[0.98] ${
          created
            ? "bg-green-50 text-green-600 cursor-default"
            : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-50"
        }`}
      >
        {created ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            EVENT CREATED
          </>
        ) : isPending ? (
          "CREATING..."
        ) : (
          "ADD TO CALENDAR"
        )}
      </button>
    </div>
  );
}
