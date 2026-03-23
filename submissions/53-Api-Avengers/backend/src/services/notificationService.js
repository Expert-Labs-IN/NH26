import Notification from '../models/Notification.js';

export async function getNotifications() {
  return await Notification.find().sort({ createdAt: -1 });
}

export async function saveNotification(data) {
  const notification = new Notification({
    id: generateId(),
    message: data.message,
    type: data.type || 'info',
    emailId: data.emailId || null,
    read: false,
  });
  await notification.save();
  return notification;
}

export async function markNotificationRead(id) {
  return await Notification.findOneAndUpdate(
    { id }, 
    { read: true }, 
    { new: true }
  );
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
