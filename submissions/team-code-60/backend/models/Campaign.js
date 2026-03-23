import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productData: {
    name: String,
    description: String,
    color: String,
    material: String,
    weight: String,
    dimensions: String,
    price: String,
    targetAudience: String,
    additionalInfo: String,
  },
  model: { type: String, enum: ['groq', 'gemini', 'openai'], default: 'groq' },
  result: { type: mongoose.Schema.Types.Mixed, required: true },
  bannerUrls: { type: mongoose.Schema.Types.Mixed, default: [] },
  adCopy: { type: mongoose.Schema.Types.Mixed },
  emailCopy: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Campaign', campaignSchema);
