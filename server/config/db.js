const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    const isProduction = process.env.NODE_ENV === 'production';
    const useMemoryDB =
      !uri ||
      (!isProduction && (uri.includes('localhost') || uri.includes('127.0.0.1')));

    if (isProduction && !uri) {
      throw new Error('MONGODB_URI is required in production');
    }

    if (useMemoryDB) {
      // Zero-config dev mode: spin up an in-memory MongoDB instance
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('🧪 Using in-memory MongoDB (dev mode) — data resets on restart');
      console.log('   👉 Set MONGODB_URI in server/.env to persist data with Atlas');

      // Graceful shutdown
      process.on('beforeExit', async () => { await mongod.stop(); });
      process.on('SIGINT',      async () => { await mongod.stop(); process.exit(0); });
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
