#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('📱 Sideloadly Installation Guide for Windows\n');

console.log('🎯 What You Need:');
console.log('1. Sideloadly (Windows app)');
console.log('2. Your iPhone connected to your ROG Strix');
console.log('3. Your Apple ID credentials\n');

console.log('📥 Step 1: Download Sideloadly');
console.log('1. Go to: https://sideloadly.io/');
console.log('2. Click "Download for Windows"');
console.log('3. Install Sideloadly on your ROG Strix\n');

console.log('📱 Step 2: Prepare Your iPhone');
console.log('1. Connect your iPhone to your ROG Strix via USB');
console.log('2. Trust the computer on your iPhone');
console.log('3. Make sure your iPhone is unlocked\n');

console.log('🔧 Step 3: Create IPA File');
console.log('Since you don\'t have Xcode, we need to use a different approach:');
console.log('1. Ask a friend with Mac to build the IPA file');
console.log('2. Or use online services like:');
console.log('   - https://www.altstore.io/ (online builder)');
console.log('   - https://www.sideloadly.io/ (online builder)');
console.log('3. Or use GitHub Actions to build automatically\n');

console.log('📦 Step 4: Install with Sideloadly');
console.log('1. Open Sideloadly on your ROG Strix');
console.log('2. Drag and drop your IPA file into Sideloadly');
console.log('3. Enter your Apple ID credentials');
console.log('4. Click "Start" - App will install on your iPhone\n');

console.log('🔄 Step 5: Automatic Updates');
console.log('Once installed, your app will:');
console.log('✅ Update automatically when you deploy to Vercel');
console.log('✅ No reinstallation needed');
console.log('✅ Works just like your PWA\n');

console.log('📁 Your iOS Project Location: ./ios/');
console.log('🔗 Live Updates: App will check https://your-vercel-app.vercel.app for updates\n');

console.log('❓ Need Help?');
console.log('- Sideloadly FAQ: https://sideloadly.io/faq/');
console.log('- Or ask a friend with Mac to help build the IPA file');
console.log('- Or use online IPA builders\n');

console.log('🎯 Next Steps:');
console.log('1. Download Sideloadly');
console.log('2. Get IPA file (friend with Mac or online builder)');
console.log('3. Install on your iPhone');
console.log('4. Test automatic updates');
