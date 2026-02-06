# Warm Connection & Playbook - Complete Setup Guide

Welcome! This guide will help you set up and run the Warm Connection & Playbook application on your computer, even if you're not technical.

## 🎯 What This Application Does

This application helps you:
- Find warm connections between your company and prospects
- Generate personalized sales playbooks
- Create email sequences for outreach

## 🚀 Quick Start - Use the Deployed Version

**Don't want to set up locally?** You can use our deployed application right away!

👉 **Visit: https://warm-connection-and-playbook-2026-m2mp6ja67.vercel.app/**

No setup required! Just visit the link and start using the application.

---

## 💻 Local Setup - Run on Your Computer

If you want to run this application on your own computer, follow the steps below.

### Prerequisites (Things You Need First)

Before starting, you need to install these programs on your computer:

#### 1. **Node.js** (JavaScript Runtime)
   - **What it is:** A program that runs JavaScript code on your computer
   - **Download from:** https://nodejs.org/
   - **Which version:** Download the "LTS" version (Long Term Support)
   - **How to install:**
     1. Go to the website
     2. Click the big green button that says "Download LTS"
     3. Run the downloaded file
     4. Keep clicking "Next" and accept the defaults
     5. Wait for installation to complete
   - **How to verify it's installed:**
     - Open Command Prompt (Windows) or Terminal (Mac)
     - Type: `node --version`
     - You should see something like `v20.x.x`
     - Type: `npm --version`
     - You should see something like `10.x.x`

#### 2. **Python** (Only if you want to run the Python backend locally)
   - **What it is:** A programming language needed for the AI playbook generation
   - **Download from:** https://www.python.org/downloads/
   - **Which version:** Python 3.9 or higher
   - **How to install:**
     1. Go to the website
     2. Download the latest version
     3. **IMPORTANT:** Check the box that says "Add Python to PATH" during installation
     4. Click "Install Now"
   - **How to verify it's installed:**
     - Open Command Prompt (Windows) or Terminal (Mac)
     - Type: `python --version` or `python3 --version`
     - You should see something like `Python 3.x.x`

#### 3. **Git** (Version Control)
   - **What it is:** A tool to download code from the internet
   - **Download from:** https://git-scm.com/downloads
   - **How to install:**
     1. Download for your operating system
     2. Run the installer
     3. Keep all the default settings
   - **How to verify it's installed:**
     - Open Command Prompt or Terminal
     - Type: `git --version`
     - You should see something like `git version 2.x.x`

---

## 📥 Step 1: Download the Project

1. **Open Command Prompt (Windows) or Terminal (Mac)**
   - Windows: Press `Windows Key + R`, type `cmd`, press Enter
   - Mac: Press `Command + Space`, type `terminal`, press Enter

2. **Navigate to where you want to save the project**
   ```bash
   # For example, go to your Documents folder:
   cd Documents
   ```

3. **Download the project**
   ```bash
   git clone <your-repository-url>
   cd warm_connection_and_playbook_2026
   ```

---

## 🗂️ Project Structure

```
warm_connection_and_playbook_2026/
├── client/          # Frontend (Website interface)
├── server/          # Backend (Node.js API server)
└── SETUP.md         # This file
```

---

## 🎯 Setup Options

You have **THREE** components that can work together:

### Option A: Full Local Setup
- ✅ Run everything on your computer
- ✅ Complete control
- ❌ More complex setup

### Option B: Hybrid Setup (Recommended)
- ✅ Run frontend and Node.js server locally
- ✅ Use deployed Python backend
- ✅ Easier setup
- ✅ Faster to get started

### Option C: Use Deployed Version
- ✅ No setup required
- ✅ Just visit the URL
- ❌ No customization

---

## 🛠️ Component Setup

### 1. Frontend Setup (Client)

The frontend is the website you see in your browser.

📖 **[Go to Client Setup Guide](./client/SETUP.md)**

Quick steps:
1. Navigate to client folder: `cd client`
2. Install dependencies: `npm install`
3. Create `.env.local` file
4. Run: `npm run dev`
5. Open: http://localhost:3001

### 2. Backend Setup - Node.js Server

The Node.js server handles API requests and database operations.

📖 **[Go to Server Setup Guide](./server/SETUP.md)**

Quick steps:
1. Navigate to server folder: `cd server`
2. Install dependencies: `npm install`
3. Setup database (see below)
4. Create `.env` file with database credentials
5. Run: `npm start`
6. Server runs on: http://localhost:3000

### 3. Backend Setup - Python Playbook Server (Optional)

The Python server generates AI-powered sales playbooks.

**Option 1: Use Deployed Version (Easiest)**
- Already configured to use: `https://email-sequence-finder-2026.onrender.com`
- No setup needed!

**Option 2: Run Locally**
1. Clone the Python backend repository:
   ```bash
   git clone https://github.com/your-org/playbook-python-backend
   cd playbook-python-backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   pip install PyJWT
   ```

3. Follow the README instructions in that repository

4. Update your Node.js server `.env` file to point to `http://localhost:8000` (or whatever port)

---

## 🗄️ Database Setup

The application uses **PostgreSQL** database (powered by Supabase).

### Option 1: Use Our Database (Easiest)
The code already has database credentials configured. You can use our shared database for testing.

⚠️ **Note:** This is for testing only. For production, use your own database.

### Option 2: Create Your Own Database

#### Step 1: Create a Supabase Account

1. **Go to:** https://supabase.com
2. **Click:** "Start your project"
3. **Sign up** with your email or GitHub account

#### Step 2: Create a New Project

1. **Click:** "New Project"
2. **Enter:**
   - Project name: `warm-connections` (or any name you like)
   - Database password: Create a strong password (SAVE THIS!)
   - Region: Choose the one closest to you
3. **Click:** "Create new project"
4. **Wait:** 2-3 minutes for the database to be ready

#### Step 3: Get Your Database Connection String

1. **Click:** "Project Settings" (gear icon in the left sidebar)
2. **Click:** "Database" in the settings menu
3. **Scroll down** to "Connection string"
4. **Select:** "URI" tab
5. **Copy** the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@...`)
6. **Replace** `[YOUR-PASSWORD]` with your actual database password

#### Step 4: Set Up Database Tables

1. **Click:** "SQL Editor" in the left sidebar
2. **Click:** "New query"
3. **Copy and paste** this SQL code:

```sql
-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stage TEXT,
  clay_run_id TEXT,
  playbook_run_id TEXT,
  merged_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

4. **Click:** "Run" (or press F5)
5. **You should see:** "Success. No rows returned"

#### Step 5: Update Your Server Configuration

1. Open `server/.env` file
2. Replace the `DATABASE_URL` with your connection string:
   ```
   DATABASE_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres'
   ```

---

## 🏃 Running the Application

### For Hybrid Setup (Recommended):

**Terminal 1 - Start Node.js Server:**
```bash
cd server
npm start
```
You should see: `Server running on port 3000`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
You should see: `- ready started server on 0.0.0.0:3001, url: http://localhost:3001`

**Open your browser:**
- Go to: http://localhost:3001
- You should see the application!

### For Full Local Setup:

Same as above, but also:

**Terminal 3 - Start Python Backend:**
```bash
cd path/to/playbook-python-backend
python app.py
```

---

## 🔍 Troubleshooting

### "Command not found" errors
- Make sure you installed Node.js, Python, and Git
- Restart your terminal after installation
- On Windows, try running Command Prompt as Administrator

### Port already in use
- Another program is using port 3000 or 3001
- Close other applications or change the port in the code

### Database connection errors
- Check your DATABASE_URL in `.env` file
- Make sure your password doesn't have special characters that need escaping
- Verify your internet connection (Supabase is cloud-based)

### Module not found errors
- Make sure you ran `npm install` in the correct folder
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again

### Python errors
- Make sure Python is installed: `python --version`
- Make sure you installed PyJWT: `pip install PyJWT`
- Try using `python3` instead of `python` on Mac/Linux

---

## 🆘 Getting Help

If you're stuck:

1. **Check the detailed setup guides:**
   - [Client Setup](./client/SETUP.md)
   - [Server Setup](./server/SETUP.md)

2. **Use the deployed version:**
   - https://warm-connection-and-playbook-2026-m2mp6ja67.vercel.app/

3. **Contact support** or create an issue in the repository

---

## 📝 Summary

### Quick Reference:

| Component | Local URL | Deployed URL |
|-----------|-----------|--------------|
| Frontend | http://localhost:3001 | https://warm-connection-and-playbook-2026-m2mp6ja67.vercel.app/ |
| Node.js Server | http://localhost:3000 | https://warm-connection-and-playbook-2026.onrender.com |
| Python Backend | http://localhost:8000 | https://email-sequence-finder-2026.onrender.com |

### Environment Variables Needed:

**Client (`client/.env.local`):**
```
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

**Server (`server/.env`):**
```
DATABASE_URL=your-postgres-connection-string
PORT=3000
PLAYBOOK_API_URL=https://email-sequence-finder-2026.onrender.com/workflows/playbook-ai---sales-intelligence-pipeline/runs
CLAY_INPUT_WEBHOOK_URL=your-clay-webhook-url
```

---

## 🎉 You're All Set!

Once everything is running, you can:
1. Open http://localhost:3001 in your browser
2. Enter a company domain (e.g., `microsoft.com`)
3. Watch the application find warm connections and generate a sales playbook!

Enjoy using the Warm Connection & Playbook application! 🚀
