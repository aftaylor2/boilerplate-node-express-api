import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import url from 'url';

// ESM AppRoot
const appRoot = url.fileURLToPath(import.meta.url).split('db.mjs')[0];

const getENV = () =>
  process.env?.NODE_ENV?.trim()?.toLowerCase() === 'production'
    ? '.env'
    : '.dev.env';


// Load Config
dotenv.config({ path: `${appRoot}/.config.env` });
// Load Secrets
dotenv.config({ path: `${appRoot}/${getENV()}` });

const connectDB = async () => {
  const { MONGO_URI } = process.env;
  const MONGO_OPTIONS = {  };

  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(MONGO_URI, MONGO_OPTIONS);

  // Connect to MongoDB
  mongoose.connection.on('connecting', () => {
    console.log('Connecting to MongoDB…');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB Connection Error: ', error);
    mongoose.disconnect();
  });

  mongoose.connection.on('connected', () =>
    console.log(`MongoDB Connected ${mongoose.connection.host}`)
  );

  mongoose.connection.once('open', () => {
    console.log('MongoDB Connection Opened');
  });

  mongoose.connection.on('reconnected', () => {
    console.log(`MongoDB Reconnected ${mongoose.connection.host}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB Disconnected');
    mongoose.connect(MONGO_URI, MONGO_OPTIONS);
  });

  if (!conn || !conn.connection || !conn.connection.host) {
    console.error('MongoDB Connection FAILURE');
    return false;
  }

  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

export default connectDB;


