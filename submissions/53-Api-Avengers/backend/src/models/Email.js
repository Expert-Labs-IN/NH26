import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  subject: { type: String },
  sender: { type: String },
  recipient: { type: String },
  body: { type: String },
  thread: { type: [String], default: [] },
  received_at: { type: Date, default: Date.now },
  triage: {
    summary: { type: [String] },
    priority: { type: String, enum: ['Urgent', 'Action Required', 'FYI', null] },
    suggestedAction: {
      type: { type: String, enum: ['reply', 'calendar', 'task', null] },
      payload: { type: mongoose.Schema.Types.Mixed }
    },
    reasoning: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'ignored', null] },
    calendarEventId: { type: String },
    calendarEventLink: { type: String },
    latency_ms: { type: Number },
    draftReply: {
      body: { type: String },
      sentAt: { type: Date },
      status: { type: String, enum: ['draft', 'sent', 'discarded', null] }
    }
  }
}, { timestamps: true });

export default mongoose.model('Email', EmailSchema);
