import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
    apiKey: process.env.GEMINI_API_KEY || '',
    modelName: process.env.AI_MODEL_NAME || 'gemini-2.5-flash',
}));