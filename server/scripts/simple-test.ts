#!/usr/bin/env ts-node

console.log('TEST: Script is running!');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

import 'dotenv/config';
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✅' : 'NOT SET ❌');

console.log('Test complete!');
