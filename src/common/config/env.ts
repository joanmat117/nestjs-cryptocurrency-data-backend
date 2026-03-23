import { z } from 'zod';
import { type ConfigService, registerAs } from '@nestjs/config';

export const envSchema = z.object({
  SEARCH_HASH_PEPPER: z.string().min(16, 'Pepper must be at least 32 characters'),
  VERIFICATION_HASH_SECRET: z.string().min(16, 'Pepper must be at least 32 characters'),
  NODE_ENV: z.enum(['development', 'production', 'testing']).default('development'),
  DATABASE_URL: z.url(),
  ACCESS_TOKEN_SECRET: z.string().min(16, 'Access token secret must be at least 16 characters'),
  REFRESH_TOKEN_SECRET: z.string().min(16, 'Refresh token secret must be at least 16 characters'),
  CMC_PRO_API_KEY: z.string('CoinMarketCap api key must be defined')
});

export type EnvConfig = z.infer<typeof envSchema>;

export const registerEnvConfig = registerAs('app', () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid config', parsed.error.format());
    throw new Error('Environment validation failed');
  }

  return parsed.data;
});

export function getEnvConfig(configService: ConfigService): EnvConfig {
  return configService.get('app') as EnvConfig;
}
