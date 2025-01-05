import { config } from 'dotenv';
import { z } from 'zod';

const envVariables = z.object({
  CDK_DEFAULT_ACCOUNT: z.string(),
  CDK_DEFAULT_REGION: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
});

export const initializeDotenv = () => {
  config();
  envVariables.parse(process.env);
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
