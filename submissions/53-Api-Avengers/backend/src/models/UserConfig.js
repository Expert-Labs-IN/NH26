import mongoose from 'mongoose';

const UserConfigSchema = new mongoose.Schema({
  id: { type: String, default: '__config__', unique: true },
  googleToken: { type: Object }
}, { timestamps: true });

export default mongoose.model('UserConfig', UserConfigSchema);
