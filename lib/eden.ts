import { edenTreaty } from '@elysiajs/eden';
import type { App } from '@/app/api/[[...slugs]]/route';

// Use APP_URL for production/preview, fallback to localhost for local dev
const url = process.env.APP_URL || 'http://localhost:3000';

// Type-safe Eden Client
export const eden = edenTreaty<App>(url);
