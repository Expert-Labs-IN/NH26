import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specs: {
    weight: String,
    material: String,
    color: String,
    dimensions: String,
    category: String,
    price: String,
    extra: String,
  },
  imageBase64: { type: String }, // stored as base64 for simplicity
  copy: {
    seoDescription: String,
    instagramCaption: String,
    linkedinPost: String,
  },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Product', productSchema);
