import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/high-school-manager',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    accessExpiration: (process.env.JWT_ACCESS_EXPIRATION || '15m') as string,
    refreshExpiration: (process.env.JWT_REFRESH_EXPIRATION || '7d') as string,
  },
  
  apiKey: process.env.API_KEY || 'your-api-key',
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5174',
      'https://high-school-manager-zd2a.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
    ].filter(Boolean),
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // Increased from 100 to 1000
  },
};
