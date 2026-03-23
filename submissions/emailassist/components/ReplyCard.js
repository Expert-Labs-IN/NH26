"use client";

import { useState, useEffect, useTransition } from "react";
import { sendReply } from "@/actions/sendReply";

const TONES = ["formal", "friendly", "assertive"];

export default function ReplyCard({ email, onUpdate }) {
  const [replyBody, setReplyBody] = useState(email.suggestedReply?.body || "");
  const [replySubject, setReplySubject] = useState(email.suggestedReply?.subject || `Re: ${email.subject}`);
  const [tone, setTone] = useState("formal");
  const [customInstruction, setCustomInstruction] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSending, startSending] = useTransition();
  const [sent, setSent] = useState(email.replySent);
  const [error, setError] = useState("");

  // Reset ALL state when the selected email changes
  useEffect(() => {
    setReplyBody(email.suggestedReply?.body || "");
    setReplySubject(email.suggestedReply?.subject || `Re: ${email.subject}`);
    setTone("formal");
    setCustomInstruction("");
    setSent(email.replySent || false);
    setError("");
  }, [email.emailId]);

  // Regenerate reply via /api/emails/reply (calls FastAPI)
  async function handleRegenerate() {
    setIsRegenerating(true);
    setError("");
    try {
      const res = await fetch("/api/emails/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: email.emailId,
          subject: email.subject,
          senderName: email.senderName,
          emailBody: email.body,
          tone,
          customInstruction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regeneration failed");
      setReplyBody(data.reply?.body || replyBody);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegenerating(false);
    }
  }

  // Send reply via Server Action
  function handleSend() {
    if (sent) return;
    startSending(async () => {
      try {
        setError("");
        await sendReply({
          emailId: email.emailId,
          to: email.senderEmail,
          subject: replySubject,
          body: replyBody,
          threadId: email.emailId, // Gmail uses message ID as thread anchor
        });
        setSent(true);
        if (onUpdate) onUpdate({ ...email, replySent: true });
      } catch (err) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Reply</h3>

      {/* Tone selector */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">Tone:</span>
        {TONES.map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
              tone === t
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Editable reply body */}
      <textarea
        value={replyBody}
        onChange={(e) => setReplyBody(e.target.value)}
        rows={7}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 resize-y focus:outline-none focus:border-blue-500 transition-colors mb-3"
        placeholder="Reply body..."
      />

      {/* Custom instruction */}
      <input
        type="text"
        value={customInstruction}
        onChange={(e) => setCustomInstruction(e.target.value)}
        placeholder='Custom instruction (e.g. "Reschedule to next week")'
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors mb-3"
      />

      {/* Error */}
      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {isRegenerating ? (
            <span className="w-3 h-3 border-t border-blue-400 rounded-full animate-spin" />
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {isRegenerating ? "Regenerating…" : "Regenerate"}
        </button>

        <button
          onClick={handleSend}
          disabled={isSending || sent}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            sent
              ? "bg-green-600/20 text-green-400 border border-green-600/30 cursor-default"
              : "bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
          }`}
        >
          {sent ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sent
            </>
          ) : isSending ? (
            "Sending…"
          ) : (
            "Send Reply"
          )}
        </button>
      </div>
    </div>
  );
}
