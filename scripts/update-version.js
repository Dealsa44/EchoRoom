#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to increment version number
function incrementVersion(version) {
  const match = version.match(/driftzo-v(\d+)/);
  if (match) {
    const num = parseInt(match[1]) + 1;
    return `driftzo-v${num}`;
  }
  return 'driftzo-v1';
}

// Function to update service worker version
function updateServiceWorkerVersion() {
  const swPath = path.join(__dirname, '../public/sw.js');
  
  try {
    let content = fs.readFileSync(swPath, 'utf8');
    const currentVersion = content.match(/const CACHE_NAME = '([^']+)'/)?.[1];
    
    if (currentVersion) {
      const newVersion = incrementVersion(currentVersion);
      content = content.replace(
        /const CACHE_NAME = '[^']+'/,
        `const CACHE_NAME = '${newVersion}'`
      );
      
      fs.writeFileSync(swPath, content);
      console.log(`✅ Service Worker version updated: ${currentVersion} → ${newVersion}`);
      
      // Also update the manifest.json version if it exists
      const manifestPath = path.join(__dirname, '../public/manifest.json');
      if (fs.existsSync(manifestPath)) {
        let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.version = newVersion.replace('driftzo-', '');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`✅ Manifest version updated: ${manifest.version}`);
      }
    } else {
      console.log('❌ Could not find CACHE_NAME in service worker');
    }
  } catch (error) {
    console.error('❌ Error updating service worker version:', error.message);
  }
}

// Function to update package.json version
function updatePackageVersion() {
  const packagePath = path.join(__dirname, '../package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Increment patch version
    const newVersion = `${major}.${minor}.${patch + 1}`;
    packageJson.version = newVersion;
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Package version updated: ${currentVersion} → ${newVersion}`);
  } catch (error) {
    console.error('❌ Error updating package version:', error.message);
  }
}

// Main execution
console.log('🚀 Updating Driftzo version for deployment...\n');

updateServiceWorkerVersion();
updatePackageVersion();

console.log('\n✨ Version update complete! Ready for deployment.');
console.log('💡 Remember to commit these changes before deploying to Vercel.');

export {
  incrementVersion,
  updateServiceWorkerVersion,
  updatePackageVersion
};
