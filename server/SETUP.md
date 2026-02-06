# Backend Server (Node.js) Setup Guide

This guide will help you set up and run the **Node.js backend server** for the Warm Connection & Playbook application.

## 📋 What is the Backend Server?

The backend server is the **brain** of the application. It:
- 🗄️ Communicates with the database
- 🔄 Handles API requests from the frontend
- 🌐 Manages webhooks from external services (Clay, Playbook AI)
- 📊 Processes and merges data from different sources

It's built using:
- **Node.js** - JavaScript runtime
- **Express.js** - Web server framework
- **PostgreSQL** - Database (via Supabase)

---

## ✅ Prerequisites

Before you start, make sure you have:

### 1. Node.js Installed
- **Check if installed:** Open terminal and type `node --version`
- **Should see:** `v20.x.x` or higher
- **If not installed:** Download from https://nodejs.org/ (get the LTS version)

### 2. npm Installed (comes with Node.js)
- **Check if installed:** Open terminal and type `npm --version`
- **Should see:** `10.x.x` or higher

### 3. Database Access
- **Option A:** Use the provided database (already configured in `.env`)
- **Option B:** Create your own Supabase database (see Database Setup section)

---

## 🚀 Step-by-Step Setup

### Step 1: Open Terminal in the Server Folder

#### On Windows:
1. Open File Explorer
2. Navigate to the `server` folder inside the project
3. Click in the address bar at the top
4. Type `cmd` and press Enter
5. A Command Prompt window will open in that folder

#### On Mac/Linux:
1. Open Terminal
2. Navigate to the server folder:
   ```bash
   cd path/to/warm_connection_and_playbook_2026/server
   ```

---

### Step 2: Install Dependencies

Dependencies are pieces of code (libraries) that the server needs to work.

**Type this command and press Enter:**
```bash
npm install
```

**What you'll see:**
- Lots of text scrolling by
- Messages about downloading packages
- This might take 1-2 minutes

**When it's done, you'll see:**
- A new folder called `node_modules` in the server folder
- A file called `package-lock.json`
- Your terminal will show a prompt again

**Packages installed:**
- `express` - Web server framework
- `cors` - Handles cross-origin requests (allows frontend to communicate with backend)
- `dotenv` - Loads environment variables from `.env` file
- `pg` - PostgreSQL database client
- `node-fetch` - Makes HTTP requests to external APIs
- `uuid` - Generates unique IDs

---

### Step 3: Understand the Environment Variables

The server needs certain configuration values to work. These are stored in a `.env` file.

**The `.env` file already exists** in the `server` folder with these values:

```bash
# Database connection string
DATABASE_URL='postgresql://postgres.ukislwzdnjpwxfkggggl:mXYjKf5Sz0FcJaV0@aws-1-eu-central-1.pooler.supabase.com:6543/postgres'

# Server port (defaults to 3000 if not set)
PORT=3000

# Playbook API endpoint
PLAYBOOK_API_URL=https://email-sequence-finder-2026.onrender.com/workflows/playbook-ai---sales-intelligence-pipeline/runs

# Clay webhook URL for triggering Clay flows
CLAY_INPUT_WEBHOOK_URL=https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-b96dd247-8f52-4db8-9b48-50a34a58fdc2

# Additional allowed CORS origins (comma-separated, optional)
# Example: ALLOWED_ORIGINS=https://example.com,https://another-domain.com
# ALLOWED_ORIGINS=
```

### What Each Variable Means:

#### `DATABASE_URL`
- **What it is:** Connection string to your PostgreSQL database
- **Format:** `postgresql://username:password@host:port/database`
- **Current value:** Points to a Supabase PostgreSQL database
- **When to change:** If you want to use your own database (see Database Setup section)

#### `PORT`
- **What it is:** The port number the server will run on
- **Default:** 3000
- **When to change:** If port 3000 is already being used by another application
- **Example:** Change to `PORT=3001` to use port 3001

#### `PLAYBOOK_API_URL`
- **What it is:** URL of the Python backend that generates sales playbooks
- **Current value:** Points to the deployed Python service
- **When to change:** If you're running the Python backend locally
- **Local value:** `http://localhost:8000/workflows/playbook-ai---sales-intelligence-pipeline/runs` (or whatever port your Python server uses)

#### `CLAY_INPUT_WEBHOOK_URL`
- **What it is:** Webhook URL for triggering Clay workflows
- **Current value:** Points to a Clay webhook
- **When to change:** If you have your own Clay account and webhook
- **How to get your own:**
  1. Go to https://clay.com
  2. Create an account
  3. Create a webhook in your Clay workflow
  4. Copy the webhook URL

#### `ALLOWED_ORIGINS` (Optional)
- **What it is:** Additional allowed CORS origins (for security)
- **Format:** Comma-separated URLs
- **Example:** `ALLOWED_ORIGINS=https://myapp.com,https://staging.myapp.com`
- **When to use:** If you deploy the frontend to a custom domain

---

### Step 4: Verify Database Connection (Optional)

Let's make sure the database is accessible.

**Open the `.env` file and check the `DATABASE_URL`:**
- If you see a valid connection string, you're good to go!
- The current database is already set up and has the correct tables

**If you want to use your own database, see the "Database Setup" section below.**

---

### Step 5: Start the Server

Now we're ready to run the server!

**Type this command and press Enter:**
```bash
npm start
```

**What you'll see:**
```
Server running on port 3000
```

**This means:**
- ✅ The server is running!
- ✅ It's listening on http://localhost:3000
- ✅ The server will keep running until you stop it

---

### Step 6: Test the Server

Let's make sure the server is working correctly.

#### Test 1: Health Check

1. **Open your web browser**
2. **Go to:** http://localhost:3000/health
3. **You should see:**
   ```json
   {"status":"ok"}
   ```

**If you see this, the server is working! ✅**

#### Test 2: Check the Terminal

Look at your terminal window where the server is running. You should see:
- `Server running on port 3000`
- No error messages

---

## 🗄️ Database Setup

The application uses a **PostgreSQL** database to store job information.

### Option 1: Use the Existing Database (Easiest)

The `.env` file already has a database connection string configured. You can use this for testing!

**Pros:**
- ✅ No setup needed
- ✅ Already has the correct tables
- ✅ Works immediately

**Cons:**
- ⚠️ Shared with others (for testing only)
- ⚠️ Not recommended for production

---

### Option 2: Create Your Own Supabase Database

If you want your own private database:

#### Step 1: Create a Supabase Account

1. **Go to:** https://supabase.com
2. **Click:** "Start your project"
3. **Sign up** with your email, GitHub, or Google account
4. **Verify your email** (check your inbox)

#### Step 2: Create a New Project

1. **After logging in, click:** "New Project"
2. **Fill in the details:**
   - **Organization:** Create a new organization (or select existing)
   - **Name:** `warm-connections` (or any name you like)
   - **Database Password:** Create a **strong password**
     - ⚠️ **IMPORTANT:** Save this password somewhere safe!
     - You'll need it later
     - Example: `MySecurePassword123!`
   - **Region:** Choose the one closest to you
     - North America: `us-east-1`
     - Europe: `eu-central-1`
     - Asia: `ap-southeast-1`
   - **Pricing Plan:** Free (for testing)
3. **Click:** "Create new project"
4. **Wait:** 2-3 minutes for Supabase to set up your database

#### Step 3: Get Your Database Connection String

1. **Once the project is ready, click:** "Project Settings" (gear icon in the left sidebar)
2. **Click:** "Database" in the settings menu
3. **Scroll down** to the "Connection string" section
4. **Select the "URI" tab**
5. **You'll see a connection string like:**
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-1-[REGION].pooler.supabase.com:6543/postgres
   ```
6. **Click the "Copy" button** to copy it
7. **Important:** This string has `[YOUR-PASSWORD]` as a placeholder
   - You need to replace it with your actual database password
   - The password is the one you created in Step 2

**Example:**
```
# Before (what you copy):
postgresql://postgres.ukislwzdnjpwxfkggggl:[YOUR-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres

# After (with your password):
postgresql://postgres.ukislwzdnjpwxfkggggl:MySecurePassword123!@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

#### Step 4: Update Your .env File

1. **Open the `server/.env` file** in a text editor
2. **Replace the `DATABASE_URL` line** with your new connection string:
   ```
   DATABASE_URL='postgresql://postgres.YOUR-PROJECT:[YOUR-PASSWORD]@aws-1-REGION.pooler.supabase.com:6543/postgres'
   ```
3. **Save the file**

#### Step 5: Create Database Tables

Now we need to create the tables that the application needs.

1. **Go back to Supabase in your browser**
2. **Click:** "SQL Editor" in the left sidebar (it looks like a `<>` icon)
3. **Click:** "New query" button
4. **Copy and paste** this SQL code into the editor:

```sql
-- =====================================================
-- Warm Connection & Playbook Database Schema
-- =====================================================

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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_domain ON jobs(prospect_domain);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function before each update
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (optional, for security)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON jobs TO authenticated;
-- GRANT USAGE ON SEQUENCE jobs_id_seq TO authenticated;
```

5. **Click:** "Run" (or press `F5` on your keyboard)
6. **You should see:**
   - "Success. No rows returned" (this is good!)
   - Or a message saying the tables were created

**What this SQL does:**
- Creates a `jobs` table to store playbook generation jobs
- Adds indexes for faster database queries
- Sets up automatic timestamp updates
- Creates a trigger to update `updated_at` automatically

#### Step 6: Verify Tables Were Created

1. **In the Supabase left sidebar, click:** "Table Editor"
2. **You should see:** A table called `jobs`
3. **Click on `jobs`** to see the table structure

**Columns you should see:**
- `id` - Unique identifier (UUID)
- `prospect_domain` - The company domain (e.g., "microsoft.com")
- `status` - Job status (pending, processing, completed, failed)
- `stage` - Current processing stage
- `clay_run_id` - ID from Clay API
- `playbook_run_id` - ID from Playbook API
- `merged_result` - Final results (JSON)
- `created_at` - When the job was created
- `updated_at` - When the job was last updated

#### Step 7: Test Your Database Connection

1. **Make sure your `.env` file has the correct `DATABASE_URL`**
2. **Restart your server:**
   - Press `Ctrl+C` in the terminal to stop the server
   - Run `npm start` again
3. **Check the terminal:**
   - If you see "Server running on port 3000" with no errors, the database connection works!
   - If you see database errors, double-check your connection string

---

## 🔧 Backend Architecture

### Routes / Endpoints

The server has these API endpoints:

#### **GET /health**
- **What it does:** Health check endpoint
- **Returns:** `{"status":"ok"}`
- **Use:** To verify the server is running

#### **POST /jobs**
- **What it does:** Creates a new playbook generation job
- **Request body:**
  ```json
  {
    "prospect_domain": "example.com"
  }
  ```
- **Returns:**
  ```json
  {
    "id": "uuid-here",
    "status": "pending",
    "prospect_domain": "example.com"
  }
  ```

#### **GET /jobs/:id**
- **What it does:** Gets the status and results of a job
- **URL parameter:** Job ID (UUID)
- **Returns:**
  ```json
  {
    "id": "uuid",
    "status": "completed",
    "merged_result": { ... }
  }
  ```

#### **GET /result?domain=example.com**
- **What it does:** Gets completed results for a domain
- **Query parameter:** `domain` (company domain)
- **Returns:** The merged playbook results

#### **POST /webhooks/clay**
- **What it does:** Receives webhook from Clay when warm connections are found
- **Request body:** Clay webhook payload
- **Returns:** Success response

#### **POST /webhooks/playbook**
- **What it does:** Receives webhook from Playbook AI when playbook is generated
- **Request body:** Playbook webhook payload
- **Returns:** Success response

---

### File Structure

```
server/
├── src/
│   ├── server.js              # Main server file
│   ├── db/
│   │   └── index.js          # Database connection
│   └── routes/
│       ├── jobs.js           # Job CRUD operations
│       ├── result.js         # Result retrieval
│       ├── clayWebhook.js    # Clay webhook handler
│       ├── playbookWebhook.js # Playbook webhook handler
│       └── testPlaybook.js   # Test endpoint
├── .env                       # Environment variables (you configured this!)
├── package.json              # Dependencies and scripts
└── SETUP.md                  # This file
```

---

## 🐍 Python Backend Setup (Optional)

The application also uses a **Python backend** for AI-powered playbook generation.

### Option 1: Use Deployed Python Backend (Easiest - Already Configured!)

The `.env` file already points to the deployed Python backend:
```
PLAYBOOK_API_URL=https://email-sequence-finder-2026.onrender.com/workflows/playbook-ai---sales-intelligence-pipeline/runs
```

**No setup needed!** The Node.js server will use this deployed service.

---

### Option 2: Run Python Backend Locally

If you want to run the Python backend on your own computer:

#### Prerequisites:
1. **Python 3.9 or higher** installed
   - Check: `python --version` or `python3 --version`
   - Download from: https://python.org

#### Steps:

1. **Clone the Python backend repository:**
   ```bash
   git clone <python-backend-repository-url>
   cd playbook-python-backend
   ```

2. **Install Python dependencies:**
   ```bash
   # Create a virtual environment (recommended)
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt

   # Install PyJWT (IMPORTANT - not in requirements.txt!)
   pip install PyJWT
   ```

3. **Follow the setup instructions** in the Python backend's README file

4. **Run the Python server:**
   ```bash
   python app.py
   ```

   The Python server will typically run on port 8000.

5. **Update your Node.js server `.env` file:**
   ```
   PLAYBOOK_API_URL=http://localhost:8000/workflows/playbook-ai---sales-intelligence-pipeline/runs
   ```

6. **Restart your Node.js server** for the changes to take effect

---

## 🔒 CORS Configuration

CORS (Cross-Origin Resource Sharing) is a security feature that controls which websites can access your API.

### Current Configuration:

The server allows requests from:
- `http://localhost:3001` (local frontend development)
- `http://localhost:3000` (local frontend alternate port)
- `https://warm-connection-and-playbook-2026.vercel.app` (deployed frontend)
- `https://email-sequence-finder-2026.onrender.com` (Python backend)

### Adding More Allowed Origins:

If you deploy your frontend to a custom domain:

1. **Open `server/.env`**
2. **Add the `ALLOWED_ORIGINS` variable:**
   ```
   ALLOWED_ORIGINS=https://myapp.com,https://staging.myapp.com
   ```
3. **Restart the server**

**Format:** Comma-separated URLs, no spaces

---

## 🛑 Stopping the Server

When you're done:

1. **Go to the terminal** where the server is running
2. **Press:** `Ctrl + C` (Windows/Linux) or `Command + C` (Mac)
3. **You'll see:** The server stops and you get your command prompt back

To start it again, run `npm start` again!

---

## 🐛 Troubleshooting

### Error: "Port 3000 is already in use"

**Problem:** Another application is using port 3000

**Solution 1:** Stop the other application

**Solution 2:** Change the port:
1. Open `.env`
2. Change `PORT=3000` to `PORT=3001` (or any unused port)
3. Restart the server
4. **Important:** Update your frontend's `.env.local` to point to the new port!

---

### Error: "Cannot find module ..."

**Problem:** Dependencies not installed

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json  # Mac/Linux
# or on Windows: delete the folders manually

# Reinstall
npm install
```

---

### Database Connection Errors

**Error examples:**
- "connection refused"
- "timeout"
- "authentication failed"

**Solutions:**

1. **Check your `DATABASE_URL` in `.env`:**
   - Make sure it's a valid PostgreSQL connection string
   - Format: `postgresql://username:password@host:port/database`
   - No extra spaces or line breaks

2. **Check your password:**
   - Make sure you replaced `[YOUR-PASSWORD]` with your actual password
   - Special characters might need URL encoding
   - Try wrapping the whole connection string in quotes

3. **Check your internet connection:**
   - Supabase is cloud-based and needs internet access

4. **Check Supabase status:**
   - Go to your Supabase project dashboard
   - Make sure the project is active (green status)

5. **Test the connection:**
   - Open the Supabase SQL Editor
   - Run a simple query: `SELECT NOW();`
   - If this works, your database is fine

---

### Webhook Errors

**Problem:** Webhooks from Clay or Playbook API are failing

**Check:**
1. **Webhook URLs are correct:**
   - `CLAY_INPUT_WEBHOOK_URL` is valid
   - `PLAYBOOK_API_URL` is accessible

2. **Server is accessible:**
   - If running locally, webhooks from external services won't work
   - You need to deploy the server or use a tool like ngrok

3. **Test with the deployed backend:**
   - The deployed backend at `https://warm-connection-and-playbook-2026.onrender.com` is already set up for webhooks

---

### Server starts but API calls fail

**Problem:** Server runs but frontend can't communicate with it

**Check:**
1. **CORS configuration:**
   - Open browser console (F12)
   - Look for CORS errors
   - Make sure your frontend's origin is in the allowed origins list

2. **Server logs:**
   - Check the terminal where the server is running
   - Look for error messages

3. **Network:**
   - Test the health endpoint: http://localhost:3000/health
   - If this doesn't work, the server isn't running properly

---

## 🧪 Testing the Server

### Test 1: Health Check
```bash
# Open in browser or use curl:
curl http://localhost:3000/health

# Should return:
{"status":"ok"}
```

### Test 2: Create a Job
```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{"prospect_domain":"microsoft.com"}'

# Should return a job object with an ID
```

### Test 3: Get Job Status
```bash
# Replace JOB_ID with the ID from Test 2
curl http://localhost:3000/jobs/JOB_ID

# Should return the job details
```

---

## 🚀 Deploying to Production

When ready to deploy:

### Option 1: Render.com (Recommended)

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Click:** "New +" → "Web Service"
4. **Connect your repository**
5. **Configure:**
   - **Name:** `warm-playbook-backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. **Add environment variables:**
   - Click "Advanced"
   - Add each variable from your `.env` file
7. **Click:** "Create Web Service"

Render will build and deploy your server!

### Option 2: Other Platforms

The server can run on:
- Heroku
- AWS (Elastic Beanstalk, EC2, ECS)
- Google Cloud Run
- Azure App Service
- DigitalOcean App Platform

Just make sure to:
1. Set all environment variables
2. Use Node.js 20 or higher
3. Run `npm start` as the start command

---

## 📞 Need Help?

If you're stuck:

1. **Check the main setup guide:** [../SETUP.md](../SETUP.md)
2. **Check the frontend setup guide:** [../client/SETUP.md](../client/SETUP.md)
3. **Try the deployed backend:** https://warm-connection-and-playbook-2026.onrender.com
4. **Open an issue** in the repository

---

## ✅ Quick Checklist

Before asking for help, make sure:

- [ ] Node.js is installed (`node --version` works)
- [ ] npm is installed (`npm --version` works)
- [ ] You're in the `server` folder
- [ ] Dependencies are installed (`node_modules` exists)
- [ ] `.env` file exists and has all required variables
- [ ] Database connection string is correct
- [ ] Server starts without errors (`npm start` works)
- [ ] Health endpoint returns OK (http://localhost:3000/health)
- [ ] No firewall blocking port 3000

---

## 🎉 Success!

Once everything is working:
- ✅ Server runs on http://localhost:3000
- ✅ Health check returns `{"status":"ok"}`
- ✅ Database connection works
- ✅ API endpoints respond correctly
- ✅ Frontend can communicate with backend

Happy coding! 🚀
