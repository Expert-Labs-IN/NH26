import { generateWithOpenAI } from '../services/openaiService.js';
import { generateWithGemini } from '../services/geminiService.js';
import { generateWithGroq } from '../services/groqService.js';
import { generateWithClaude } from '../services/claudeService.js';
import { generateAdCopy } from '../services/adCopyService.js';
import { generateEmailCopy } from '../services/emailCopyService.js';
import { generateBannerUrls } from '../services/bannerService.js';
import { analyzeProductImage } from '../services/imageAnalysisService.js';
import { parseVoiceTranscript } from '../services/voiceParseService.js';
import { refineContent, generatePersonas } from '../services/refineService.js';
import Campaign from '../models/Campaign.js';

const getAIResult = async (productData, model) => {
  switch (model) {
    case 'openai': return await generateWithOpenAI(productData);
    case 'gemini': return await generateWithGemini(productData);
    case 'claude': return await generateWithClaude(productData);
    case 'groq': default: return await generateWithGroq(productData);
  }
};

export const generateCampaign = async (req, res) => {
  try {
    const { productData, model } = req.body;
    if (!productData || !model) {
      return res.status(400).json({ message: 'Missing data' });
    }

    // Generate all content in parallel
    const [result, adCopy, emailCopy, bannerUrls] = await Promise.all([
      getAIResult(productData, model),
      generateAdCopy(productData, model).catch(() => null),
      generateEmailCopy(productData, model).catch(() => null),
      generateBannerUrls(productData).catch(() => []),
    ]);

    // Save to campaign history
    const campaign = await Campaign.create({
      userId: req.user.id,
      productData,
      model,
      result,
      bannerUrls,
      adCopy,
      emailCopy,
    });

    res.json({
      success: true,
      data: {
        ...result,
        adCopy,
        emailCopy,
        bannerUrls,
        campaignId: campaign._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get campaign history
export const getCampaignHistory = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('productData.name model createdAt');
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single campaign
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, userId: req.user.id });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({
      success: true,
      data: {
        ...campaign.result,
        adCopy: campaign.adCopy,
        emailCopy: campaign.emailCopy,
        bannerUrls: campaign.bannerUrls,
        campaignId: campaign._id,
        productData: campaign.productData,
        model: campaign.model,
        createdAt: campaign.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Analyze product image with AI Vision
export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    const result = await analyzeProductImage(req.file.buffer, req.file.mimetype);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Parse voice transcript into product fields
export const parseVoice = async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ success: false, message: 'No transcript provided' });
    }
    const result = await parseVoiceTranscript(transcript.trim());
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Refine a single content section with AI
export const refineContentSection = async (req, res) => {
  try {
    const { content, platform, instruction } = req.body;
    if (!content || !instruction) {
      return res.status(400).json({ success: false, message: 'Missing content or instruction' });
    }
    const refined = await refineContent(content, platform || 'general', instruction);
    res.json({ success: true, data: { refined } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate audience personas
export const getPersonas = async (req, res) => {
  try {
    const { productData } = req.body;
    if (!productData) {
      return res.status(400).json({ success: false, message: 'Missing product data' });
    }
    const result = await generatePersonas(productData);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
