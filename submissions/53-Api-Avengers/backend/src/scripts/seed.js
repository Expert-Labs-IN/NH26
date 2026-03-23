import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Email from '../models/Email.js';
import connectDB from '../db/connect.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  await connectDB();

  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../data/mock_emails.json'), 'utf-8');
    const emails = JSON.parse(rawData);

    await Email.deleteMany(); // Clear existing records
    console.log('Cleared existing emails from database...');

    await Email.insertMany(emails);
    console.log(`Successfully seeded database with ${emails.length} mock emails!`);
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
