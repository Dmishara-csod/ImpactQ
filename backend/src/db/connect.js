import mongoose from 'mongoose'

import { config } from '../config.js'

export async function connectDb() {
  if (!config.mongoUri) {
    console.warn('[db] MONGODB_URI not set — analyses will not be persisted')
    return false
  }

  try {
    await mongoose.connect(config.mongoUri)
    console.log('[db] Connected to MongoDB')
    return true
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message)
    return false
  }
}
