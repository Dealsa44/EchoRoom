#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🍎 Preparing iOS app for installation...\n');

try {
  // Check if iOS project exists
  const iosPath = './ios';
  if (!fs.existsSync(iosPath)) {
    console.error('❌ iOS project not found. Run "npx cap add ios" first.');
    process.exit(1);
  }

  // Build the web app
  console.log('📦 Building web app...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Sync with Capacitor
  console.log('🔄 Syncing with Capacitor...');
  execSync('npx cap sync ios', { stdio: 'inherit' });
  
  console.log('\n✅ iOS project ready for installation!');
  console.log('\n📱 Installation Options:');
  console.log('\n1. AltStore (Recommended):');
  console.log('   - Download: https://altstore.io/');
  console.log('   - Install on your computer and iPhone');
  console.log('   - Use to install EchoRoom app');
  
  console.log('\n2. Sideloadly (Alternative):');
  console.log('   - Download: https://sideloadly.io/');
  console.log('   - Install on your computer');
  console.log('   - Connect iPhone and install app');
  
  console.log('\n3. Friend with Mac:');
  console.log('   - Open ./ios/ folder in Xcode');
  console.log('   - Build and install on your iPhone');
  
  console.log('\n📁 Project Location: ./ios/');
  console.log('🔗 Live Updates: App will update automatically when you deploy to Vercel');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Choose installation method above');
  console.log('2. Follow the installation guide');
  console.log('3. Test the app on your iPhone');
  console.log('4. Deploy to Vercel to test automatic updates');
  
} catch (error) {
  console.error('❌ Preparation failed:', error.message);
  process.exit(1);
}
