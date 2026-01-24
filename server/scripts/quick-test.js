console.log('✅ Script execution test - Node.js is working!');
console.log('Current directory:', process.cwd());
require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✅' : 'NOT SET ❌');
