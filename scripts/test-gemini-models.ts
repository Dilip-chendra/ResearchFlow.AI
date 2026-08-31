import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function testGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini API key...');
  const ai = new GoogleGenAI({ apiKey });

  const candidates = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-2.0-flash-exp'
  ];

  for (const model of candidates) {
    console.log(`\nTesting model: ${model}...`);
    try {
      const res = await ai.models.generateContent({
        model,
        contents: 'Say hello in 3 words.',
      });
      console.log(`[PASS] ${model} response:`, res.text?.trim());
    } catch (err: any) {
      console.log(`[FAIL] ${model} error:`, err.message);
    }
  }
}

testGeminiModels();
