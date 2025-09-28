import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;

  projectId: string;
  privateKey: string;
  clientEmail: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  //Firebase
  projectId: process.env.FIREBASE_PROJECT_ID!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
};

export default config;
