# Fuzzie - Demo & Distribution Guide

## 🎯 Distribution Options

I've created **3 methods** for distributing your app for demos and evaluation:

---

## Option 1: **Portable Package** (RECOMMENDED) ⭐

**Best for:** Demo presentations, CD distribution, evaluators without technical knowledge

### Create Package:
```bash
# Run the batch file
scripts\create-portable-package.bat
```

This creates a `portable-fuzzie` folder containing:
- ✅ Complete Next.js standalone build
- ✅ All static assets and Prisma schema
- ✅ START-FUZZIE.bat launcher (double-click to run)
- ✅ Configuration file (.env.production)
- ✅ README with instructions

### Distribute:
1. **Zip the folder:**
   ```bash
   # Right-click portable-fuzzie → Send to → Compressed folder
   # Or use: 7-Zip, WinRAR, etc.
   ```

2. **Share the ZIP** (via USB, email, CD, cloud storage)

3. **Recipients do:**
   - Extract ZIP
   - Install Node.js (if not installed): https://nodejs.org/
   - Double-click `START-FUZZIE.bat`
   - Open browser to `http://localhost:3000`

### For Demo CD:
```
📀 CD Contents:
├── portable-fuzzie.zip
├── node-installer.msi (optional - bundle Node.js installer)
└── QUICK_START.txt (instructions)
```

---

## Option 2: **Standalone Executable** (Advanced)

**Best for:** Single-file distribution, kiosk mode

### Prerequisites:
```bash
npm install -g pkg
```

### Create .exe:
```bash
# Build the app first
npm run build

# Create executable
node scripts/build-exe.js

# Output: dist/fuzzie-app.exe
```

### Distribute:
Create a folder with:
```
fuzzie-demo/
├── fuzzie-app.exe          ← The executable
├── .env.production         ← Configuration
├── .next/                  ← Build files (needed)
│   ├── static/
│   └── standalone/
├── public/                 ← Static files
└── README.txt              ← Instructions
```

**Zip this folder** and distribute.

### Recipients do:
```bash
# Extract and run:
fuzzie-app.exe

# Or double-click the .exe file
```

---

## Option 3: **Docker Container** (Cross-platform)

**Best for:** Evaluators familiar with Docker, consistent environment

### Create Dockerfile:
```dockerfile
# Already in your project root
```

### Build & Save:
```bash
# Build Docker image
docker build -t fuzzie-app .

# Save to file
docker save fuzzie-app > fuzzie-app.tar

# Or create distributable:
docker save fuzzie-app | gzip > fuzzie-app.tar.gz
```

### Distribute:
Share `fuzzie-app.tar.gz` file

### Recipients do:
```bash
# Load image
docker load < fuzzie-app.tar.gz

# Run container
docker run -p 3000:3000 --env-file .env fuzzie-app

# Open: http://localhost:3000
```

---

## 📋 Pre-Demo Checklist

### 1. **Build the Application**
```bash
npm run build
```

### 2. **Create Distribution Package**
```bash
# For portable package (recommended):
scripts\create-portable-package.bat

# For .exe:
node scripts/build-exe.js
```

### 3. **Test Locally**
```bash
cd portable-fuzzie
START-FUZZIE.bat

# Or:
cd dist
fuzzie-app.exe
```

### 4. **Prepare Demo Environment File**

Create `.env.production` with these settings:

**For Local Demo (no internet):**
```env
# Use localhost
NEXT_PUBLIC_URL=http://localhost:3000

# Mock/disable external services for offline demo
```

**For Live Demo (with ngrok):**
```env
# Use your ngrok domain
NEXT_PUBLIC_URL=https://crissy-uneliminated-milagro.ngrok-free.dev

# Real credentials for live webhooks
```

### 5. **Create Demo Data**
- Pre-configure workflows
- Connect integrations beforehand
- Have sample files ready
- Prepare GitHub repo for demo

---

## 🎬 Demo Presentation Flow

### Before Demo:
1. **Start ngrok** (if doing live webhooks):
   ```bash
   ngrok http --domain=crissy-uneliminated-milagro.ngrok-free.dev 3000
   ```

2. **Start application**:
   ```bash
   START-FUZZIE.bat
   # Or: fuzzie-app.exe
   ```

3. **Open in browser**: `http://localhost:3000`

4. **Verify connections**: Check `/connections` page shows active

### During Demo:
1. **Show Dashboard** - Overview of stats
2. **Show Connections** - GitHub, Google Drive, Slack, Discord
3. **Create Workflow** - Drag-and-drop editor
4. **Live Trigger** - Upload file / Make commit
5. **Show Logs** - Real-time execution

### Demo Script:
```
1. "This is Fuzzie - workflow automation platform"
2. Login → Show dashboard with metrics
3. Connections → "Connected to GitHub, Google Drive, Slack"
4. Workflows → "Let me create a workflow"
5. Drag GitHub trigger → Configure repo
6. Add Discord action → Set message template
7. Publish workflow
8. Make a commit → Show Discord notification
9. Show logs → Execution details
10. "All automated, no code needed!"
```

---

## 💾 CD/USB Distribution Package

### Recommended Structure:
```
FUZZIE_DEMO_CD/
├── 📁 Application/
│   └── portable-fuzzie.zip         ← Main package
│
├── 📁 Prerequisites/
│   ├── nodejs-installer.msi        ← Node.js installer
│   └── ngrok-windows.zip           ← ngrok (optional)
│
├── 📁 Documentation/
│   ├── README.txt                  ← Start here
│   ├── INSTALLATION_GUIDE.pdf
│   ├── USER_MANUAL.pdf
│   └── DEMO_VIDEO.mp4              ← Optional demo video
│
├── 📄 QUICK_START.txt              ← Immediate instructions
└── 📄 AUTORUN.inf                  ← CD autorun (optional)
```

### Create QUICK_START.txt:
```
==================================================
FUZZIE WORKFLOW AUTOMATION - QUICK START
==================================================

STEP 1: Install Node.js
- Open "Prerequisites/nodejs-installer.msi"
- Follow installation wizard
- Restart computer if prompted

STEP 2: Extract Application
- Go to "Application" folder
- Right-click "portable-fuzzie.zip"
- Choose "Extract All..."
- Extract to your preferred location

STEP 3: Run Application
- Navigate to extracted folder
- Double-click "START-FUZZIE.bat"
- Wait for "Server started" message

STEP 4: Open in Browser
- Open Chrome, Firefox, or Edge
- Go to: http://localhost:3000
- Sign up or log in

STEP 5: Explore Features
- Check Dashboard for overview
- Visit Connections to link accounts
- Create Workflows in the editor
- View execution history in Logs

==================================================
SUPPORT: Check documentation folder for guides
==================================================
```

---

## 🔒 Security for Distribution

### Before distributing, sanitize:

1. **Remove sensitive data from .env.production:**
```env
# Replace real credentials with placeholders
DATABASE_URL="YOUR_DATABASE_URL_HERE"
CLERK_SECRET_KEY="YOUR_CLERK_KEY_HERE"
GITHUB_CLIENT_SECRET="YOUR_GITHUB_SECRET_HERE"
```

2. **Include setup instructions** for recipients to add their own credentials

3. **Clear cached data:**
```bash
# Delete these before zipping:
.next/cache/
node_modules/
.env (use .env.example instead)
```

---

## 📊 Distribution Comparison

| Method | File Size | Ease of Use | Requirements | Best For |
|--------|-----------|-------------|--------------|----------|
| **Portable Package** | ~50-100 MB | ⭐⭐⭐⭐⭐ | Node.js | CD, demos |
| **Standalone .exe** | ~80-150 MB | ⭐⭐⭐⭐ | None | Single file |
| **Docker** | ~300-500 MB | ⭐⭐⭐ | Docker | Tech evaluators |
| **Source Code** | ~200 MB | ⭐⭐ | Node.js, npm | Developers |

---

## ✅ Final Steps

### 1. Choose Distribution Method:
```bash
# For portable package (EASIEST):
scripts\create-portable-package.bat

# For .exe (SINGLE FILE):
node scripts/build-exe.js

# For Docker (ADVANCED):
docker build -t fuzzie-app .
docker save fuzzie-app | gzip > fuzzie-app.tar.gz
```

### 2. Create Distribution ZIP:
```bash
# Portable method:
7z a fuzzie-demo.zip portable-fuzzie\

# .exe method:
# Manually create folder with .exe + assets, then zip
```

### 3. Test on Clean Machine:
- Extract your ZIP on another computer
- Follow your own QUICK_START.txt
- Verify everything works

### 4. Burn to CD or Copy to USB:
- Use CD burning software (Windows built-in, Nero, etc.)
- Or copy to USB flash drive

---

## 🎉 You're Ready!

Your application is now packaged and ready for:
- ✅ Live demos
- ✅ CD distribution
- ✅ Evaluation by stakeholders
- ✅ Sharing with team members

**Questions?** Check the documentation files or test the package yourself first!
