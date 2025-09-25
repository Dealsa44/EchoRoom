#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🍎 Building iOS app for EchoRoom...\n');

try {
  // Build the web app
  console.log('📦 Building web app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Sync with Capacitor
  console.log('🔄 Syncing with Capacitor...');
  execSync('npx cap sync ios', { stdio: 'inherit' });
  
  console.log('\n✅ iOS project ready!');
  console.log('\n📱 Next steps:');
  console.log('1. Install AltStore on your iPhone (free)');
  console.log('2. Use Sideloadly to install the app (free)');
  console.log('3. Or use a Mac with Xcode to build and install');
  
  console.log('\n📁 iOS project location: ./ios/');
  console.log('🔗 For live updates, your app will check: https://your-vercel-app.vercel.app');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
