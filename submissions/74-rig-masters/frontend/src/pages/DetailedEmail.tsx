import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Reply,
  Forward,
  MoreHorizontal,
  Zap,
  CheckCircle2,
  Pencil,
  RefreshCw,
  Brain,
  Send,
  Info,
  AlertCircle,
  Calendar,
  ListChecks,
  Loader2,
  X,
  Mic,
  Keyboard,
  Square,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiEmail {
  id: string;
  message_id: string;
  sender: string;
  sender_name: string;
  recipient: string;
  subject: string;
  body: string;
  received_at: string;
  priority_label: string;
  priority_reasoning: string;
  suggested_actions: string[];
  summary_bullets: string[];
  is_read: boolean;
  created_at: string;
}

interface ReplyContent {
  subject: string;
  body: string;
}

interface CalendarContent {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  location: string;
}

interface TaskItem {
  title: string;
  description: string;
  due_date: string;
  priority: string;
}

type ActionContent = ReplyContent | CalendarContent | TaskItem[];
type BadgeIntent = "urgent" | "warning" | "danger" | "neutral";
type InputMode = "typing" | "voice";

interface Action {
  id: string;
  email_id: string;
  action_type: "reply" | "calendar_event" | "task_extraction";
  content: ActionContent;
  edited_content: ActionContent | null;
  status: "pending" | "executed" | "rejected";
  executed_at: string | null;
  execution_payload: Record<string, unknown> | null;
  regeneration_prompt: string | null;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = "http://localhost:8000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isReplyContent(c: ActionContent): c is ReplyContent {
  return !Array.isArray(c) && "body" in c && "subject" in c;
}

function isCalendarContent(c: ActionContent): c is CalendarContent {
  return !Array.isArray(c) && "start_datetime" in c;
}

function isTaskList(c: ActionContent): c is TaskItem[] {
  return Array.isArray(c);
}

function actionIcon(type: string) {
  if (type === "reply") return <Reply size={15} className="text-[#8083ff]" />;
  if (type === "calendar_event") return <Calendar size={15} className="text-[#8083ff]" />;
  if (type === "task_extraction") return <ListChecks size={15} className="text-[#8083ff]" />;
  return <Zap size={15} className="text-[#8083ff]" />;
}

function actionLabel(type: string) {
  if (type === "reply") return "Drafted Reply";
  if (type === "calendar_event") return "Calendar Event";
  if (type === "task_extraction") return "Extracted Tasks";
  return "Action";
}

// ─── Voice Recognition Hook ───────────────────────────────────────────────────

type VoiceState = "idle" | "listening" | "processing" | "unsupported";

function useVoiceRecognition(onTranscript: (text: string) => void) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!isSupported) return;
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setVoiceState("listening");
      setInterimText("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results?.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      setInterimText(interim || final);
      if (final) {
        setVoiceState("processing");
        onTranscript(final.trim());
        setInterimText("");
      }
    };

    recognition.onerror = () => {
      setVoiceState("idle");
      setInterimText("");
    };

    recognition.onend = () => {
      setVoiceState("idle");
      setInterimText("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, onTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState("idle");
    setInterimText("");
  }, []);

  return { voiceState, interimText, start, stop, isSupported };
}

// ─── TweakModeToggle ──────────────────────────────────────────────────────────

interface TweakModeToggleProps {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
  voiceSupported: boolean;
}

function TweakModeToggle({ mode, onChange, voiceSupported }: TweakModeToggleProps) {
  return (
    <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-white/5 self-start">
      <button
        onClick={() => onChange("typing")}
        title="Type your instruction"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
          mode === "typing"
            ? "bg-[#8083ff]/20 text-[#8083ff] shadow-sm"
            : "text-[#464554] hover:text-[#908fa0]"
        }`}
      >
        <Keyboard size={12} />
        Type
      </button>
      {voiceSupported && (
        <button
          onClick={() => onChange("voice")}
          title="Speak your instruction"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
            mode === "voice"
              ? "bg-[#8083ff]/20 text-[#8083ff] shadow-sm"
              : "text-[#464554] hover:text-[#908fa0]"
          }`}
        >
          <Mic size={12} />
          Voice
        </button>
      )}
    </div>
  );
}

// ─── ActionCard ───────────────────────────────────────────────────────────────

interface ActionCardProps {
  action: Action;
  onRegenerate: (id: string, prompt: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onEdit: (id: string, content: ActionContent) => Promise<void>;
}

function ActionCard({ action, onRegenerate, onApprove, onReject, onEdit }: ActionCardProps) {
  const [showTweak, setShowTweak] = useState(false);
  const [tweakPrompt, setTweakPrompt] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("typing");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [editableBody, setEditableBody] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleVoiceTranscript = useCallback((text: string) => {
    setTweakPrompt((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  const {
    voiceState,
    interimText,
    start: startVoice,
    stop: stopVoice,
    isSupported: voiceSupported,
  } = useVoiceRecognition(handleVoiceTranscript);

  const isListening = voiceState === "listening";

  const activeContent = action.edited_content ?? action.content;

  useEffect(() => {
    if (isReplyContent(activeContent)) setEditableBody(activeContent.body);
  }, [action.id, action.edited_content, action.content]);

  // When mode changes, stop any active voice session
  const handleModeChange = (mode: InputMode) => {
    if (mode !== "voice" && isListening) stopVoice();
    setInputMode(mode);
    if (mode === "typing") setTimeout(() => inputRef.current?.focus(), 50);
  };

  // When tweak panel closes, reset everything
  const handleToggleTweak = () => {
    if (showTweak) {
      stopVoice();
      setTweakPrompt("");
      setInputMode("typing");
    }
    setShowTweak((v) => !v);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableBody(e.target.value);
    setIsDirty(true);
  };

  const handleSaveEdit = async () => {
    if (!isReplyContent(activeContent)) return;
    setIsSavingEdit(true);
    await onEdit(action.id, { ...activeContent, body: editableBody });
    setIsDirty(false);
    setIsSavingEdit(false);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    stopVoice();
    await onRegenerate(action.id, tweakPrompt);
    setTweakPrompt("");
    setShowTweak(false);
    setIsDirty(false);
    setIsRegenerating(false);
  };

  const handleApprove = async () => {
    setIsApproving(true);
    await onApprove(action.id);
    setIsApproving(false);
  };

  const isExecuted = action.status === "executed";
  const isRejected = action.status === "rejected";
  const isDone = isExecuted || isRejected;

  return (
    <div
      className={`ai-card-gradient rounded-2xl p-6 flex flex-col gap-4 shadow-lg border transition-all ${
        isDone ? "border-white/5 opacity-60" : "border-white/5"
      }`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          {actionIcon(action.action_type)}
          <span className="font-medium text-[15px]">{actionLabel(action.action_type)}</span>
        </div>
        {isExecuted && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
            Sent
          </span>
        )}
        {isRejected && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md border border-red-400/20">
            Rejected
          </span>
        )}
      </div>

      {/* ── Reply content ── */}
      {isReplyContent(activeContent) && (
        <textarea
          className="bg-black/20 p-4 rounded-xl w-full text-[13px] text-[#c7c4d7] leading-relaxed border border-white/5 focus:border-[#8083ff]/30 transition-colors outline-none resize-none min-h-[140px]"
          value={editableBody}
          onChange={handleBodyChange}
          disabled={isDone}
        />
      )}

      {/* ── Calendar content ── */}
      {isCalendarContent(activeContent) && (
        <div className="bg-black/20 rounded-xl p-4 text-[13px] text-[#c7c4d7] space-y-2 border border-white/5">
          <div className="font-semibold text-[#dae2fd]">{activeContent.title}</div>
          <div className="text-[#908fa0]">{activeContent.description}</div>
          <div className="flex flex-col gap-1 mt-2 text-xs text-[#908fa0]">
            <span>
              🕐{" "}
              {new Date(activeContent.start_datetime).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              —{" "}
              {new Date(activeContent.end_datetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {activeContent.location && <span>📍 {activeContent.location}</span>}
          </div>
        </div>
      )}

      {/* ── Task list content ── */}
      {isTaskList(activeContent) && (
        <div className="space-y-2">
          {activeContent.map((task, i) => (
            <div key={i} className="bg-black/20 rounded-xl p-4 text-[13px] border border-white/5">
              <div className="font-medium text-[#dae2fd] mb-1">{task.title}</div>
              <div className="text-[#908fa0] text-xs leading-relaxed">{task.description}</div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-[#908fa0]">
                  Due: <span className="text-[#c7c4d7]">{task.due_date}</span>
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wide text-[10px] ${
                    task.priority === "urgent"
                      ? "bg-red-400/10 text-red-400"
                      : "bg-[#8083ff]/10 text-[#8083ff]"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Save edit ── */}
      {isDirty && !isDone && (
        <button
          onClick={handleSaveEdit}
          disabled={isSavingEdit}
          className="text-xs text-[#8083ff] hover:text-white transition-colors self-end flex items-center gap-1"
        >
          {isSavingEdit ? <Loader2 size={12} className="animate-spin" /> : <Pencil size={12} />}
          Save edits
        </button>
      )}

      {/* ── Controls ── */}
      {!isDone && (
        <>
          <div className="flex gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
            <button
              disabled={isRegenerating}
              onClick={handleRegenerate}
              className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[#908fa0] hover:bg-white/5 hover:text-white transition-all text-xs font-medium disabled:opacity-40"
            >
              {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Retry
            </button>
            <button
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-xs font-medium ${
                showTweak
                  ? "bg-[#8083ff]/20 text-[#8083ff]"
                  : "text-[#908fa0] hover:bg-white/5 hover:text-white"
              }`}
              onClick={handleToggleTweak}
            >
              <Brain size={14} /> Tweak
            </button>
            <button
              onClick={() => onReject(action.id)}
              className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[#908fa0] hover:bg-red-400/10 hover:text-red-400 transition-all text-xs font-medium"
            >
              <X size={14} /> Reject
            </button>
          </div>

          {/* ── Tweak Panel ── */}
          {showTweak && (
            <div className="flex flex-col gap-3">

              {/* Mode toggle + label row */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#464554] font-medium uppercase tracking-wider">
                  Input mode
                </span>
                <TweakModeToggle
                  mode={inputMode}
                  onChange={handleModeChange}
                  voiceSupported={voiceSupported}
                />
              </div>

              {/* ── TYPING mode ── */}
              {inputMode === "typing" && (
                <div className="flex items-center bg-black/20 rounded-xl px-3 h-11 border border-[#8083ff]/30 focus-within:border-[#8083ff] transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={tweakPrompt}
                    onChange={(e) => setTweakPrompt(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && tweakPrompt.trim() && handleRegenerate()
                    }
                    placeholder="e.g., make it more formal…"
                    className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder-[#464554]"
                    autoFocus
                  />
                  <button
                    disabled={!tweakPrompt.trim() || isRegenerating}
                    onClick={handleRegenerate}
                    className="text-[#464554] hover:text-[#8083ff] ml-1 shrink-0 transition-colors disabled:opacity-30"
                  >
                    {isRegenerating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              )}

              {/* ── VOICE mode ── */}
              {inputMode === "voice" && (
                <div className="flex flex-col gap-3">

                  {/* Big mic button */}
                  <div className="flex flex-col items-center gap-3 py-4">
                    <button
                      type="button"
                      onClick={isListening ? stopVoice : startVoice}
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        isListening
                          ? "bg-[#8083ff]/20 border-2 border-[#8083ff] shadow-[0_0_24px_rgba(128,131,255,0.4)]"
                          : "bg-black/30 border-2 border-white/10 hover:border-[#8083ff]/40 hover:bg-[#8083ff]/10"
                      }`}
                    >
                      {/* Pulsing ring when listening */}
                      {isListening && (
                        <>
                          <span className="absolute inset-0 rounded-full bg-[#8083ff]/20 animate-ping" />
                          <span className="absolute inset-[-6px] rounded-full border border-[#8083ff]/30 animate-pulse" />
                        </>
                      )}
                      {isListening ? (
                        <Square size={22} className="text-[#8083ff] relative" />
                      ) : (
                        <Mic size={22} className={tweakPrompt ? "text-[#8083ff]" : "text-[#908fa0]"} />
                      )}
                    </button>

                    {/* Status label */}
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`text-[12px] font-medium transition-colors ${
                          isListening ? "text-[#8083ff]" : "text-[#908fa0]"
                        }`}
                      >
                        {isListening ? "Listening… tap to stop" : "Tap to speak"}
                      </span>

                      {/* Waveform when listening */}
                      {isListening && (
                        <span className="flex items-end gap-[3px] h-4 mt-1">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <span
                              key={i}
                              className="w-[3px] rounded-full bg-[#8083ff]"
                              style={{
                                height: `${8 + Math.random() * 8}px`,
                                animation: `voiceBar 0.6s ${i * 0.1}s ease-in-out infinite alternate`,
                              }}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transcript preview */}
                  {(tweakPrompt || (isListening && interimText)) && (
                    <div className="bg-black/20 rounded-xl px-4 py-3 border border-[#8083ff]/20 min-h-[52px] flex items-start gap-2">
                      <span className="text-[11px] text-[#464554] uppercase tracking-wider mt-0.5 shrink-0">
                        {isListening && interimText ? "Hearing" : "Captured"}
                      </span>
                      <p
                        className={`text-[13px] leading-relaxed flex-1 ${
                          isListening && interimText
                            ? "text-[#8083ff] italic"
                            : "text-[#c7c4d7]"
                        }`}
                      >
                        {isListening && interimText ? interimText : tweakPrompt}
                      </p>
                      {tweakPrompt && !isListening && (
                        <button
                          onClick={() => setTweakPrompt("")}
                          className="text-[#464554] hover:text-red-400 transition-colors shrink-0 mt-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Send captured voice prompt */}
                  {tweakPrompt && !isListening && (
                    <button
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                      className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-[13px] font-medium bg-[#8083ff]/15 text-[#8083ff] hover:bg-[#8083ff]/25 border border-[#8083ff]/20 transition-all disabled:opacity-40"
                    >
                      {isRegenerating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Apply voice instruction
                    </button>
                  )}
                </div>
              )}

              <style>{`
                @keyframes voiceBar {
                  from { transform: scaleY(0.4); }
                  to   { transform: scaleY(1.2); }
                }
              `}</style>
            </div>
          )}

          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full compose-gradient text-white font-medium text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-md disabled:opacity-60"
          >
            {isApproving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {action.action_type === "reply"
              ? "Approve & Send"
              : action.action_type === "calendar_event"
                ? "Approve & Add to Calendar"
                : "Approve & Create Tasks"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DetailedEmail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [email, setEmail] = useState<ApiEmail | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isRefreshingSummary, setIsRefreshingSummary] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(380);

  const isResizing = useRef(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`${BASE}/api/emails/${id}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data: ApiEmail = await res.json();
        setEmail(data);

        if (!data.is_read) {
          await fetch(`${BASE}/api/emails/${id}/read`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_read: true }),
          });
        }

        const actionsRes = await fetch(`${BASE}/api/actions/${id}`);
        if (actionsRes.ok) {
          const actionsData: Action[] = await actionsRes.json();
          setActions(actionsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const generateDraft = useCallback(
    async (actionType: string) => {
      if (!id) return;
      setIsGeneratingDraft(true);
      try {
        const res = await fetch(`${BASE}/api/ai/draft/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action_type: actionType }),
        });
        if (!res.ok) throw new Error("Draft generation failed");
        const newAction: Action = await res.json();
        setActions((prev) => [
          ...prev.filter((a) => a.action_type !== actionType),
          newAction,
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGeneratingDraft(false);
      }
    },
    [id],
  );

  const handleRegenerate = useCallback(async (actionId: string, prompt: string) => {
    const res = await fetch(`${BASE}/api/actions/${actionId}/regenerate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt || "Regenerate this action" }),
    });
    if (!res.ok) return;
    const updated: Action = await res.json();
    setActions((prev) => prev.map((a) => (a.id === actionId ? updated : a)));
  }, []);

  const handleEdit = useCallback(async (actionId: string, content: ActionContent) => {
    const res = await fetch(`${BASE}/api/actions/${actionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edited_content: content }),
    });
    if (!res.ok) return;
    const updated: Action = await res.json();
    setActions((prev) => prev.map((a) => (a.id === actionId ? updated : a)));
  }, []);

  const handleApprove = useCallback(async (actionId: string) => {
    const res = await fetch(`${BASE}/api/actions/${actionId}/approve`, { method: "POST" });
    if (!res.ok) return;
    const updated: Action = await res.json();
    setActions((prev) => prev.map((a) => (a.id === actionId ? updated : a)));
  }, []);

  const handleReject = useCallback(async (actionId: string) => {
    const res = await fetch(`${BASE}/api/actions/${actionId}/reject`, { method: "POST" });
    if (!res.ok) return;
    const updated: Action = await res.json();
    setActions((prev) => prev.map((a) => (a.id === actionId ? updated : a)));
  }, []);

  const handleRefreshSummary = useCallback(async () => {
    if (!id || !email) return;
    setIsRefreshingSummary(true);
    try {
      const res = await fetch(`${BASE}/api/ai/summarize/${id}`, { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      setEmail((prev) => (prev ? { ...prev, summary_bullets: data.summary_bullets } : prev));
    } finally {
      setIsRefreshingSummary(false);
    }
  }, [id, email]);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = "default";
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= 800) setSidebarWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const formattedDate = email
    ? new Date(email.received_at).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const pendingActionTypes = email?.suggested_actions ?? [];
  const generatedByType = actions.reduce<Record<string, Action>>((acc, a) => {
    acc[a.action_type] = a;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#060e20]">
        <Loader2 size={20} className="animate-spin text-[#8083ff]" />
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#060e20] gap-3">
        <AlertCircle size={18} className="text-red-400" />
        <span className="text-red-400 text-sm">{error ?? "Email not found."}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full bg-[#060e20] relative overflow-hidden">
      {/* ── Main Content ── */}
      <div className="flex-1 px-10 py-10 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-[#131b2e] text-[#908fa0] hover:text-[#dae2fd] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2 flex-wrap">
            {email.priority_label && (
              <Badge intent={email.priority_label as BadgeIntent}>{email.priority_label}</Badge>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-[#dae2fd] mb-8">{email.subject}</h1>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-11 h-11 rounded-full border border-white/10 shadow-sm bg-[#131b2e] flex items-center justify-center text-[#8083ff] font-semibold text-sm flex-shrink-0">
            {email.sender_name?.charAt(0).toUpperCase() ?? email.sender.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="font-medium text-[#dae2fd]">{email.sender_name}</span>
                <span className="text-sm text-[#908fa0] ml-2">&lt;{email.sender}&gt;</span>
              </div>
              <span className="text-sm text-[#908fa0] shrink-0">{formattedDate}</span>
            </div>
            <span className="text-sm text-[#908fa0]">to {email.recipient}</span>
          </div>
        </div>

        <div className="text-[#c7c4d7] text-[15px] whitespace-pre-wrap leading-loose max-w-3xl my-2">
          {email.body}
        </div>

        <div className="mt-12 flex gap-3 pt-8 border-t border-white/5">
          <Button variant="secondary" className="gap-2 px-6 bg-[#131b2e] hover:bg-[#171f33] border-none text-white">
            <Reply size={16} /> Reply
          </Button>
          <Button variant="ghost" className="gap-2 text-[#908fa0] hover:text-white hover:bg-[#131b2e]">
            <Forward size={16} /> Forward
          </Button>
          <button className="p-2.5 rounded-lg hover:bg-[#131b2e] text-[#908fa0] transition-colors ml-auto">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* ── AI Rail ── */}
      <div
        className="glass-panel border-y-0 border-r-0 h-full p-6 lg:p-8 flex flex-col relative z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.4)] flex-shrink-0 custom-scrollbar overflow-y-auto bg-[#0a1128]/50 backdrop-blur-xl"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#8083ff]/30 active:bg-[#8083ff]/50 transition-colors z-30"
          onMouseDown={startResizing}
        />

        <div className="flex items-center gap-2 mb-8 text-[#8083ff]">
          <Sparkles size={18} />
          <span className="font-semibold text-sm tracking-wide">AI Assistant</span>
        </div>

        <div className="space-y-6">
          {email.summary_bullets.length > 0 && (
            <div className="ai-card-gradient rounded-2xl p-6 flex flex-col gap-4 shadow-lg border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Brain size={16} className="text-[#8083ff]" />
                  <span className="font-medium text-[15px]">Summary</span>
                </div>
                <button
                  onClick={handleRefreshSummary}
                  disabled={isRefreshingSummary}
                  className="text-[#464554] hover:text-[#8083ff] transition-colors disabled:opacity-40"
                  title="Regenerate summary"
                >
                  {isRefreshingSummary ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                </button>
              </div>
              <ul className="space-y-3">
                {email.summary_bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#c7c4d7] leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8083ff] flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {email.priority_reasoning && (
            <div className="bg-[#8083ff]/5 rounded-xl p-4 flex items-start gap-3 border border-[#8083ff]/10">
              <Info size={16} className="text-[#8083ff] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#908fa0] leading-relaxed">{email.priority_reasoning}</p>
            </div>
          )}

          {pendingActionTypes.map((actionType) => {
            const existingAction = generatedByType[actionType];

            if (existingAction) {
              return (
                <ActionCard
                  key={existingAction.id}
                  action={existingAction}
                  onRegenerate={handleRegenerate}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onEdit={handleEdit}
                />
              );
            }

            return (
              <div key={actionType} className="ai-card-gradient rounded-2xl p-6 flex flex-col gap-4 shadow-lg border border-white/5">
                <div className="flex items-center gap-2 text-white">
                  {actionIcon(actionType)}
                  <span className="font-medium text-[15px]">{actionLabel(actionType)}</span>
                </div>
                <p className="text-[13px] text-[#908fa0]">
                  AI can generate a {actionLabel(actionType).toLowerCase()} for this email.
                </p>
                <button
                  onClick={() => generateDraft(actionType)}
                  disabled={isGeneratingDraft}
                  className="w-full compose-gradient text-white font-medium text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-md disabled:opacity-60"
                >
                  {isGeneratingDraft ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  Generate {actionLabel(actionType)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}