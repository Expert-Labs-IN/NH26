import { useState, useEffect, useTransition } from "react";
import { sendReply } from "@/actions/sendReply";
import { Reply, Sparkles, Send, CheckCircle2, MessageSquare, Wand2, Info } from "lucide-react";

const TONES = [
  { id: "formal", label: "Formal", icon: MessageSquare },
  { id: "friendly", label: "Friendly", icon: MessageSquare },
  { id: "assertive", label: "Assertive", icon: MessageSquare },
];

export default function ReplyCard({ email, onUpdate }) {
  const [replyBody, setReplyBody] = useState(email.suggestedReply?.body || "");
  const [replySubject, setReplySubject] = useState(email.suggestedReply?.subject || `Re: ${email.subject}`);
  const [tone, setTone] = useState("formal");
  const [customInstruction, setCustomInstruction] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSending, startSending] = useTransition();
  const [sent, setSent] = useState(email.replySent);
  const [error, setError] = useState("");

  useEffect(() => {
    setReplyBody(email.suggestedReply?.body || "");
    setReplySubject(email.suggestedReply?.subject || `Re: ${email.subject}`);
    setTone("formal");
    setCustomInstruction("");
    setSent(email.replySent || false);
    setError("");
  }, [email.emailId]);

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
          threadId: email.emailId,
        });
        setSent(true);
        if (onUpdate) onUpdate({ ...email, replySent: true });
      } catch (err) {
        setError(err.message);
      }
    });
  }

  const inputClasses = "w-full bg-gray-50 rounded-lg px-6 py-5 text-base text-[#211B34] font-medium focus:outline-none focus:ring-2 focus:ring-[#211B34]/5 focus:bg-white transition-all placeholder:text-[#211B34]/20";
  const labelClasses = "text-[10px] uppercase tracking-widest font-black text-[#211B34]/30 mb-2 ml-1";

  return (
    <div className="bg-white rounded-xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED]">
          <Reply className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-black text-[#211B34]/30 uppercase tracking-[0.2em]">Response</h3>
          <p className="text-[#211B34] font-bold text-lg">AI Generated Draft</p>
        </div>
      </div>

      {/* Tone selector */}
      <div className="mb-6">
        <label className={labelClasses}>Tone Selection</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                tone === t.id
                  ? "bg-[#7C3AED] text-white"
                  : "bg-white text-[#211B34]/40 hover:text-[#7C3AED]"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editable reply body */}
      <div className="mb-6 group">
        <label className={labelClasses}>Email Content</label>
        <textarea
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          rows={8}
          className={`${inputClasses} resize-none leading-relaxed`}
          placeholder="Start typing your response..."
        />
      </div>

      {/* Custom instruction */}
      <div className="mb-8">
        <label className={labelClasses}>AI Refinement (Optional)</label>
        <div className="relative">
          <Wand2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#211B34]/30" />
          <input
            type="text"
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            placeholder='e.g. "Suggest a coffee meeting for tomorrow"'
            className={`${inputClasses} pl-14`}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-8 bg-red-50 text-red-600 rounded-lg text-sm font-bold animate-shake">
          <Info className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating || sent}
          className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg text-base font-black transition-all duration-300 active:scale-[0.98] ${
            sent
              ? "bg-gray-50 text-gray-300 cursor-not-allowed opacity-50"
              : "bg-[#7C3AED]/5 text-[#7C3AED] hover:bg-[#7C3AED]/10"
          }`}
        >
          {isRegenerating ? (
            <span className="w-5 h-5 border-2 border-t-[#7C3AED] border-[#7C3AED]/10 rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {isRegenerating ? "DRAFTING..." : "REGENERATE"}
        </button>

        <button
          onClick={handleSend}
          disabled={isSending || sent}
          className={`flex-[1.5] flex items-center justify-center gap-3 py-4 rounded-lg text-base font-black transition-all duration-300 active:scale-[0.98] ${
            sent
              ? "bg-green-50 text-green-600 cursor-default"
              : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-50"
          }`}
        >
          {sent ? (
            <>
              <CheckCircle2 className="w-6 h-6" />
              SENT SUCCESSFULLY
            </>
          ) : isSending ? (
            "SENDING..."
          ) : (
            <>
              <Send className="w-5 h-5" />
              SEND EMAIL
            </>
          )}
        </button>
      </div>
    </div>
  );
}
