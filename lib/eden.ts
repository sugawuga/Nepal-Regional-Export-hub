import { edenTreaty } from '@elysiajs/eden';
import type { App } from '@/app/api/[[...slugs]]/route';

// Use APP_URL for production/preview, fallback to localhost for local dev
const getBaseUrl = () => {
  if (process.env.APP_URL && process.env.APP_URL.startsWith('http')) {
    return process.env.APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

const url = getBaseUrl();

// Type-safe Eden Client
export const eden = edenTreaty<App>(url);
