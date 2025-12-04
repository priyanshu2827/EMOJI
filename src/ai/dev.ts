import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-whitelist.ts';
import '@/ai/flows/generate-sample-text.ts';
import '@/ai/flows/summarize-findings.ts';