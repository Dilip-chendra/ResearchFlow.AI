import 'dotenv/config';
import { geminiProvider } from '../server/ai/providers/geminiProvider';
import { openRouterProvider } from '../server/ai/providers/openrouterProvider';
import { openRouterCatalog } from '../server/ai/openrouter/catalog';

async function testLiveProviders() {
  console.log('--- Testing Live AI Providers ---');
  console.log('Gemini Configured:', geminiProvider.isConfigured());
  console.log('OpenRouter Configured:', openRouterProvider.isConfigured());

  console.log('\nFetching OpenRouter catalog...');
  try {
    const models = await openRouterCatalog.fetchAndSyncCatalog(process.env.OPENROUTER_API_KEY);
    console.log('Discovered free models count:', models.length);
    if (models.length > 0) {
      console.log('Top models:', models.slice(0, 3).map(m => m.id));
    }
  } catch (err: any) {
    console.error('OpenRouter catalog error:', err.message);
  }

  console.log('\nTesting OpenRouter health check...');
  try {
    const orHealth = await openRouterProvider.healthCheck('openrouter/free');
    console.log('OpenRouter Health Result:', JSON.stringify(orHealth));
  } catch (err: any) {
    console.error('OpenRouter Health Exception:', err.message);
  }

  console.log('\nTesting Gemini health check...');
  try {
    const geminiHealth = await geminiProvider.healthCheck('gemini-3.6-flash');
    console.log('Gemini Health Result:', JSON.stringify(geminiHealth));
  } catch (err: any) {
    console.error('Gemini Health Exception:', err.message);
  }
}

testLiveProviders();
