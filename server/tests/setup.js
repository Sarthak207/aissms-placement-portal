const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Required env vars must exist before any module (env.js) is imported — this file's
// top-level code runs before the test file's requires, but beforeAll() runs after,
// so MONGO_URI needs a synchronous placeholder here (env.js only validates the format;
// the real in-memory URI is connected separately below).
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/placeholder';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-please-ignore-me-123';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-please-ignore-me-456';
process.env.CLIENT_URL = 'http://localhost:5173';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
