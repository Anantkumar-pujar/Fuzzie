const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Fuzzie executable...\n');

// Step 1: Build Next.js app
console.log('Step 1/3: Building Next.js application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Install pkg if not already installed
console.log('Step 2/3: Installing pkg...');
try {
  execSync('npm install -g pkg', { stdio: 'inherit' });
  console.log('✅ pkg installed\n');
} catch (error) {
  console.log('⚠️  pkg installation failed, it may already be installed\n');
}

// Step 3: Create executable
console.log('Step 3/3: Creating executable...');
try {
  // Create pkg configuration
  const pkgConfig = {
    name: "fuzzie-app",
    version: "1.0.0",
    bin: "server.js",
    pkg: {
      targets: ["node18-win-x64"],
      assets: [
        ".next/standalone/**/*",
        ".next/static/**/*",
        "public/**/*",
        "prisma/**/*",
        ".env.production"
      ],
      outputPath: "dist"
    }
  };

  // Run pkg command
  const pkgCommand = `pkg . --targets node18-win-x64 --output dist/fuzzie-app.exe`;
  execSync(pkgCommand, { stdio: 'inherit' });
  
  console.log('\n✅ Executable created successfully!');
  console.log('\n📦 Output: dist/fuzzie-app.exe');
  console.log('\n========================================');
  console.log('Next steps:');
  console.log('1. Copy dist/fuzzie-app.exe to your demo machine');
  console.log('2. Copy .env.production next to the .exe');
  console.log('3. Run: fuzzie-app.exe');
  console.log('========================================\n');
  
} catch (error) {
  console.error('❌ Packaging failed:', error.message);
  console.log('\n💡 Trying alternative method with simpler packaging...\n');
  
  // Alternative: Use simpler pkg command
  try {
    execSync('pkg server.js --targets node18-win-x64 --output dist/fuzzie-app.exe', { stdio: 'inherit' });
    console.log('\n✅ Alternative packaging succeeded!');
  } catch (altError) {
    console.error('❌ Alternative packaging also failed:', altError.message);
    process.exit(1);
  }
}
