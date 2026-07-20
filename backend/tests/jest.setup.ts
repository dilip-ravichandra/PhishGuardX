// Runs before any test module is imported, so config/env.ts sees these
// values instead of throwing on missing required variables. These are
// dummy values for the test environment only - never used to talk to a
// real database or sign tokens outside of the test process.
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.LOG_LEVEL = 'error';
process.env.MONGODB_URI = 'mongodb://localhost:27017/phishguardx-test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-not-for-production';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-not-for-production';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
