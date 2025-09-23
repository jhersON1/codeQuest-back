require('dotenv').config();

console.log('=== DISCORD OAUTH CONFIGURATION CHECK ===');
console.log('DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('DISCORD_CLIENT_SECRET:', process.env.DISCORD_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('DISCORD_CALLBACK_URL:', process.env.DISCORD_CALLBACK_URL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('PORT:', process.env.PORT || '3000');

if (!process.env.DISCORD_CLIENT_ID) {
  console.error('❌ DISCORD_CLIENT_ID is required');
}
if (!process.env.DISCORD_CLIENT_SECRET) {
  console.error('❌ DISCORD_CLIENT_SECRET is required');
}
if (!process.env.FRONTEND_URL) {
  console.warn('⚠️  FRONTEND_URL is not set, using fallback');
}

console.log('\n=== URLs EXPECTED ===');
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
console.log('Backend OAuth endpoint:', `${backendUrl}/auth/discord`);
console.log('Backend callback endpoint:', process.env.DISCORD_CALLBACK_URL || `${backendUrl}/auth/discord/callback`);
console.log('Frontend callback page:', `${frontendUrl}/discord/callback`);
console.log('\n=== DISCORD APPLICATION SETTINGS SHOULD HAVE ===');
console.log('Redirect URI:', process.env.DISCORD_CALLBACK_URL || `${backendUrl}/auth/discord/callback`);