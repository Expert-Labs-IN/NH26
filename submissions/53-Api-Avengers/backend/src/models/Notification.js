import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  emailId: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
