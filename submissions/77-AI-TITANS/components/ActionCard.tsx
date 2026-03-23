'use client';

import { DraftedReply, CalendarEvent, TaskItem } from '@/types';
import { Mail, Calendar, CheckSquare, Edit, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface ActionCardProps {
  type: string;
  data: any;
  confidence: number;
  reasoning: string;
  onApprove: () => void;
  onReject: () => void;
  onEdit?: (editedData: any) => void;
}

export default function ActionCard({
  type,
  data,
  confidence,
  reasoning,
  onApprove,
  onReject,
  onEdit,
}: ActionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(data);
  const [showReasoning, setShowReasoning] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'reply':
        return <Mail className="w-5 h-5" />;
      case 'calendar':
        return <Calendar className="w-5 h-5" />;
      case 'task':
        return <CheckSquare className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'reply':
        return 'Draft Reply';
      case 'calendar':
        return 'Calendar Event';
      case 'task':
        return 'Task List';
      default:
        return 'Suggested Action';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'reply':
        return 'blue';
      case 'calendar':
        return 'green';
      case 'task':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedData);
    }
    setIsEditing(false);
  };

  const renderReplyContent = (reply: DraftedReply) => {
    if (isEditing) {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={editedData.subject}
              onChange={(e) => setEditedData({ ...editedData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Body
            </label>
            <textarea
              value={editedData.body}
              onChange={(e) => setEditedData({ ...editedData, body: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject:</span>
          <p className="text-gray-900 dark:text-white font-medium">{reply.subject}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Message:</span>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1">{reply.body}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {reply.tone}
          </span>
        </div>
      </div>
    );
  };

  const renderCalendarContent = (event: CalendarEvent) => {
    if (isEditing) {
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editedData.title}
              onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={editedData.date}
                onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={editedData.time}
                onChange={(e) => setEditedData({ ...editedData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Date:</span>
            <p className="text-gray-900 dark:text-white font-medium">
              {format(new Date(event.date), 'PPP')}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Time:</span>
            <p className="text-gray-900 dark:text-white font-medium">{event.time}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Duration:</span>
            <p className="text-gray-900 dark:text-white font-medium">{event.duration} minutes</p>
          </div>
          {event.location && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Location:</span>
              <p className="text-gray-900 dark:text-white font-medium">{event.location}</p>
            </div>
          )}
        </div>
        {event.attendees.length > 0 && (
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Attendees:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {event.attendees.map((attendee, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                >
                  {attendee}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTaskContent = (tasks: TaskItem[]) => {
    return (
      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <div
            key={idx}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="flex items-start justify-between mb-1">
              <h5 className="font-medium text-gray-900 dark:text-white">{task.title}</h5>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  task.priority === 'high'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : task.priority === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {task.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
            {task.dueDate && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Due: {format(new Date(task.dueDate), 'PP')}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'reply':
        return renderReplyContent(data);
      case 'calendar':
        return renderCalendarContent(data);
      case 'task':
        return renderTaskContent(data);
      default:
        return <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  const color = getColor();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r from-${color}-500 to-${color}-600`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="font-semibold">{getTitle()}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {Math.round(confidence * 100)}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}

        {/* Reasoning */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <span className="font-medium">Why this action?</span>
            {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showReasoning && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
              {reasoning}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex gap-2">
          {!isEditing && onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedData(data);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={onReject}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={onApprove}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Approve & Execute
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
