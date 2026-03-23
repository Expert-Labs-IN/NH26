import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
dotenv.config();

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/nexmail';
    
    // We will automatically spin up an in-memory Mongo server if we are falling back to localhost 
    // to avoid needing to manually install MongoDB on the machine for testing
    if (mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1')) {
      const mongoServer = await MongoMemoryServer.create();
      mongoURI = mongoServer.getUri();
      console.log('Spun up a local In-Memory MongoDB for development!');
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
