import { useState, useId } from 'react';
import {
  MessageSquare, Calendar, CheckSquare,
  Check, X, Edit3, ChevronDown, ChevronUp,
  Clock, MapPin, Users, Loader2, Shield
} from 'lucide-react';
import type { ActionType, CalendarEvent, ReplyVariants, ReplyTone } from '../types';
import { cn, formatDate, formatTime24 } from '../utils/helpers';

// ─── Sub-types ─────────────────────────────────────────────────────────────────

interface BaseCardProps {
  emailId: string;
  onApprove: (payload: Record<string, unknown>) => Promise<void>;
  onReject: () => void;
  isApproved?: boolean;
  isRejected?: boolean;
  confidence?: number; // 0.0 – 1.0
}

// ─── Reply Card ─────────────────────────────────────────────────────────────────

interface ReplyCardProps extends BaseCardProps {
  type: 'reply';
  replyDraft: string;
  replyVariants?: ReplyVariants;
}

// ─── Calendar Card ──────────────────────────────────────────────────────────────

interface CalendarCardProps extends BaseCardProps {
  type: 'calendar';
  event: CalendarEvent;
}

// ─── Task Card ──────────────────────────────────────────────────────────────────

interface TaskCardProps extends BaseCardProps {
  type: 'task';
  tasks: string[];
}

type ActionCardProps = ReplyCardProps | CalendarCardProps | TaskCardProps;

// ─── Shared card wrapper ────────────────────────────────────────────────────────

const CARD_CONFIG = {
  reply: {
    icon: MessageSquare,
    title: 'Reply Draft',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    approveLabel: 'Approve Reply',
    approveClasses: 'bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-400',
  },
  calendar: {
    icon: Calendar,
    title: 'Calendar Event',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    approveLabel: 'Add to Calendar',
    approveClasses: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-400',
  },
  task: {
    icon: CheckSquare,
    title: 'Task List',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    approveLabel: 'Create Tasks',
    approveClasses: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-400',
  },
} as const;

// ─── Confidence Pill ────────────────────────────────────────────────────────────

function ConfidencePill({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const colorCls =
    pct >= 80
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : pct >= 60
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', colorCls)}
      aria-label={`AI confidence: ${pct}%`}
    >
      <Shield className="w-3 h-3" aria-hidden="true" />
      {pct}%
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ActionCard(props: ActionCardProps) {
  const { type, onApprove, onReject, isApproved = false, isRejected = false, confidence } = props;
  const config = CARD_CONFIG[type];
  const IconComponent = config.icon;
  const [isApproving, setIsApproving] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const headingId = useId();

  const handleApprove = async (payload: Record<string, unknown>) => {
    setIsApproving(true);
    try {
      await onApprove(payload);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <article
      className={cn(
        'rounded-xl border transition-all duration-200 overflow-hidden',
        isApproved
          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
          : isRejected
          ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md',
        'animate-slide-up'
      )}
      aria-labelledby={headingId}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', config.iconBg)}>
            <IconComponent className={cn('w-3.5 h-3.5', config.iconColor)} aria-hidden="true" />
          </div>
          <h4 id={headingId} className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {config.title}
          </h4>
          {confidence !== undefined && <ConfidencePill confidence={confidence} />}
          {isApproved && (
            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
              <Check className="w-3 h-3" aria-hidden="true" />
              Executed
            </span>
          )}
          {isRejected && (
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-medium">
              Rejected
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        {!isApproved && !isRejected && (
          <button
            onClick={() => setIsCollapsed((c) => !c)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand card' : 'Collapse card'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Card body — hidden when collapsed or rejected */}
      {!isCollapsed && !isRejected && (
        <div className="p-4">
          {type === 'reply' && (
            <ReplyContent
              draft={(props as ReplyCardProps).replyDraft}
              replyVariants={(props as ReplyCardProps).replyVariants}
              onApprove={handleApprove}
              onReject={onReject}
              isApproved={isApproved}
              isApproving={isApproving}
              approveClasses={config.approveClasses}
              approveLabel={config.approveLabel}
            />
          )}
          {type === 'calendar' && (
            <CalendarContent
              event={(props as CalendarCardProps).event}
              onApprove={handleApprove}
              onReject={onReject}
              isApproved={isApproved}
              isApproving={isApproving}
              approveClasses={config.approveClasses}
              approveLabel={config.approveLabel}
            />
          )}
          {type === 'task' && (
            <TaskContent
              tasks={(props as TaskCardProps).tasks}
              onApprove={handleApprove}
              onReject={onReject}
              isApproved={isApproved}
              isApproving={isApproving}
              approveClasses={config.approveClasses}
              approveLabel={config.approveLabel}
            />
          )}
        </div>
      )}
    </article>
  );
}

// ─── Shared approve/reject row ──────────────────────────────────────────────────

interface ActionRowProps {
  onApprove: () => void;
  onReject: () => void;
  isApproved: boolean;
  isApproving: boolean;
  approveClasses: string;
  approveLabel: string;
}

function ActionRow({ onApprove, onReject, isApproved, isApproving, approveClasses, approveLabel }: ActionRowProps) {
  if (isApproved) return null;
  return (
    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
      <button
        onClick={onApprove}
        disabled={isApproving}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors',
          'focus:outline-none focus-visible:ring-2',
          'disabled:opacity-70 disabled:cursor-not-allowed',
          approveClasses,
        )}
        aria-label={`Approve: ${approveLabel}`}
      >
        {isApproving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        {isApproving ? 'Processing…' : 'Approve & Execute'}
      </button>
      <button
        onClick={onReject}
        disabled={isApproving}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
        aria-label="Reject this suggestion"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
        Reject
      </button>
    </div>
  );
}

// ─── Reply Content ──────────────────────────────────────────────────────────────

const TONE_TABS: { key: ReplyTone; label: string }[] = [
  { key: 'formal', label: 'Formal' },
  { key: 'short', label: 'Short' },
  { key: 'friendly', label: 'Friendly' },
];

interface ReplyContentProps {
  draft: string;
  replyVariants?: ReplyVariants;
  onApprove: (payload: Record<string, unknown>) => void;
  onReject: () => void;
  isApproved: boolean;
  isApproving: boolean;
  approveClasses: string;
  approveLabel: string;
}

function ReplyContent({ draft, replyVariants, onApprove, onReject, isApproved, isApproving, approveClasses, approveLabel }: ReplyContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTone, setSelectedTone] = useState<ReplyTone>('formal');
  const textareaId = useId();

  // The active text defaults to the variant if available, else the legacy draft
  const variantText = replyVariants?.[selectedTone] ?? draft;
  const [customText, setCustomText] = useState<Partial<Record<ReplyTone, string>>>({});

  const displayText = customText[selectedTone] ?? variantText;

  const handleToneChange = (tone: ReplyTone) => {
    setSelectedTone(tone);
    setIsEditing(false); // collapse edit mode when switching tone
  };

  return (
    <div>
      {/* Tone switcher tabs */}
      {replyVariants && !isApproved && (
        <div className="flex items-center gap-1 mb-3 p-1 bg-slate-100 dark:bg-slate-700/60 rounded-lg" role="tablist" aria-label="Reply tone">
          {TONE_TABS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={selectedTone === key}
              onClick={() => handleToneChange(key)}
              className={cn(
                'flex-1 py-1 px-2 rounded-md text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                selectedTone === key
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <label htmlFor={textareaId} className="text-xs font-medium text-slate-500">
          Reply text
        </label>
        {!isApproved && (
          <button
            onClick={() => setIsEditing((e) => !e)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1"
            aria-pressed={isEditing}
          >
            <Edit3 className="w-3 h-3" aria-hidden="true" />
            {isEditing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>
      {isEditing ? (
        <textarea
          id={textareaId}
          value={displayText}
          onChange={(e) => setCustomText((prev) => ({ ...prev, [selectedTone]: e.target.value }))}
          rows={6}
          className="w-full text-sm text-slate-700 dark:text-slate-200 leading-relaxed border border-blue-200 dark:border-blue-800 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700"
          aria-label="Edit reply text"
        />
      ) : (
        <p
          id={textareaId}
          className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700 whitespace-pre-wrap"
        >
          {displayText}
        </p>
      )}
      <ActionRow
        onApprove={() => onApprove({ body: displayText, tone: selectedTone })}
        onReject={onReject}
        isApproved={isApproved}
        isApproving={isApproving}
        approveClasses={approveClasses}
        approveLabel={approveLabel}
      />
    </div>
  );
}

// ─── Calendar Content ───────────────────────────────────────────────────────────

interface CalendarContentProps {
  event: CalendarEvent;
  onApprove: (payload: Record<string, unknown>) => void;
  onReject: () => void;
  isApproved: boolean;
  isApproving: boolean;
  approveClasses: string;
  approveLabel: string;
}

function CalendarContent({ event, onApprove, onReject, isApproved, isApproving, approveClasses, approveLabel }: CalendarContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event.title ?? '');
  const [date, setDate] = useState(event.date ?? '');
  const [time, setTime] = useState(event.time ?? '');
  const [location, setLocation] = useState(event.location ?? '');

  if (!event.title && !event.date) {
    return (
      <p className="text-sm text-slate-400 italic">
        No meeting detected in this email.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500">Event details</span>
        {!isApproved && (
          <button
            onClick={() => setIsEditing((e) => !e)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1"
            aria-pressed={isEditing}
          >
            <Edit3 className="w-3 h-3" aria-hidden="true" />
            {isEditing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            className="w-full text-sm border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            aria-label="Event title"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              aria-label="Event date"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-sm border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              aria-label="Event time"
            />
          </div>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
            className="w-full text-sm border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            aria-label="Event location"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title || 'Untitled Event'}</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
              <span>{formatTime24(time)}</span>
            </div>
            {event.attendees.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {event.attendees.join(', ')}
                </span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmed banner */}
      {isApproved && (
        <div className="mt-3 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            ✓ Added to Calendar — Event simulated successfully
          </span>
        </div>
      )}

      <ActionRow
        onApprove={() => onApprove({ title, date, time, location, attendees: event.attendees })}
        onReject={onReject}
        isApproved={isApproved}
        isApproving={isApproving}
        approveClasses={approveClasses}
        approveLabel={approveLabel}
      />
    </div>
  );
}

// ─── Task Content ───────────────────────────────────────────────────────────────

interface TaskContentProps {
  tasks: string[];
  onApprove: (payload: Record<string, unknown>) => void;
  onReject: () => void;
  isApproved: boolean;
  isApproving: boolean;
  approveClasses: string;
  approveLabel: string;
}

function TaskContent({ tasks, onApprove, onReject, isApproved, isApproving, approveClasses, approveLabel }: TaskContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems] = useState<string[]>(tasks);
  const [checked, setChecked] = useState<boolean[]>(tasks.map(() => false));

  const updateItem = (i: number, val: string) => {
    setItems((prev) => prev.map((t, idx) => (idx === i ? val : t)));
  };

  const toggleCheck = (i: number) => {
    if (isApproved) return;
    setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500">
          {items.length} action items
        </span>
        {!isApproved && (
          <button
            onClick={() => setIsEditing((e) => !e)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1"
            aria-pressed={isEditing}
          >
            <Edit3 className="w-3 h-3" aria-hidden="true" />
            {isEditing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>

      <ul className="space-y-2" role="list">
        {items.map((task, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <button
              onClick={() => toggleCheck(i)}
              disabled={isApproved}
              className={cn(
                'flex-shrink-0 w-4 h-4 mt-0.5 rounded border-2 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                checked[i]
                  ? 'bg-amber-500 border-amber-500'
                  : 'border-slate-300 hover:border-amber-400',
                isApproved && 'border-green-400 bg-green-500 cursor-default',
              )}
              aria-checked={isApproved || checked[i]}
              aria-label={`Task ${i + 1}: ${task}`}
              role="checkbox"
            >
              {(checked[i] || isApproved) && (
                <Check className="w-2.5 h-2.5 text-white" aria-hidden="true" />
              )}
            </button>
            {isEditing ? (
              <input
                value={task}
                onChange={(e) => updateItem(i, e.target.value)}
                className="flex-1 text-sm border border-blue-200 dark:border-blue-800 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                aria-label={`Edit task ${i + 1}`}
              />
            ) : (
              <span
                className={cn(
                  'text-sm leading-snug',
                  checked[i] && !isApproved
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : isApproved
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-slate-700 dark:text-slate-300',
                )}
              >
                {task}
              </span>
            )}
          </li>
        ))}
      </ul>

      <ActionRow
        onApprove={() => onApprove({ tasks: items })}
        onReject={onReject}
        isApproved={isApproved}
        isApproving={isApproving}
        approveClasses={approveClasses}
        approveLabel={approveLabel}
      />
    </div>
  );
}
