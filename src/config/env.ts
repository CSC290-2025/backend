import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  cloudinary_name: string;
  cloudinary_api_key: string;
  cloudinary_api_secret: string;
  isProduction: boolean;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  adminRoleId: number;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  cloudinary_name: process.env.CLOUDINARY_NAME || '',
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY || '',
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET || '',
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret: process.env.JWT_SECRET || 'secret-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'secret-key',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7',

  adminRoleId: Number(process.env.ADMIN_ROLE_ID) || 1,
};

export default config;
