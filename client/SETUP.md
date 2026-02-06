# Frontend (Client) Setup Guide

This guide will help you set up and run the **frontend** (website interface) of the Warm Connection & Playbook application.

## 📋 What is the Frontend?

The frontend is the **website** you see and interact with in your browser. It's built using:
- **Next.js** - A React framework for building websites
- **TypeScript** - A programming language that adds types to JavaScript
- **Tailwind CSS** - A styling framework for making the website look good

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

---

## 🚀 Step-by-Step Setup

### Step 1: Open Terminal in the Client Folder

#### On Windows:
1. Open File Explorer
2. Navigate to the `client` folder inside the project
3. Click in the address bar at the top
4. Type `cmd` and press Enter
5. A Command Prompt window will open in that folder

#### On Mac/Linux:
1. Open Terminal
2. Navigate to the client folder:
   ```bash
   cd path/to/warm_connection_and_playbook_2026/client
   ```

---

### Step 2: Install Dependencies

Dependencies are pieces of code (libraries) that the application needs to work.

**Type this command and press Enter:**
```bash
npm install
```

**What you'll see:**
- Lots of text scrolling by
- Messages about downloading packages
- This might take 1-3 minutes

**When it's done, you'll see:**
- A new folder called `node_modules` in the client folder
- A file called `package-lock.json`
- Your terminal will show a prompt again (ready for the next command)

**If you see errors:**
- Try deleting `node_modules` folder and `package-lock.json` if they exist
- Run `npm install` again
- Make sure you're in the `client` folder (type `pwd` on Mac/Linux or `cd` on Windows to check)

---

### Step 3: Create Environment Variables File

Environment variables are settings that tell the application where to find the backend server.

#### What to do:

1. **Create a new file** in the `client` folder called `.env.local`
   - **Note:** The file name starts with a dot (`.`)
   - On Windows, you might need to create it from Command Prompt or use a text editor

#### How to create the file:

**Option A: Using Command Prompt/Terminal**
```bash
# On Windows (Command Prompt):
type nul > .env.local

# On Mac/Linux:
touch .env.local
```

**Option B: Using a Text Editor**
1. Open Notepad (Windows) or TextEdit (Mac)
2. Create a new file
3. Save it as `.env.local` in the `client` folder
4. **Important:** Make sure it's saved as `.env.local` not `.env.local.txt`

#### What to put in the file:

Open the `.env.local` file in a text editor and add this:

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

**Explanation:**
- `NEXT_PUBLIC_API_BASE` - This tells the frontend where the backend server is
- `http://localhost:3000` - This is the address of your local backend server

**If you're using the deployed backend instead:**
```bash
# Backend API URL (deployed version)
NEXT_PUBLIC_API_BASE=https://warm-connection-and-playbook-2026.onrender.com
```

#### Save the file!

---

### Step 4: Start the Development Server

Now we're ready to run the application!

**Type this command and press Enter:**
```bash
npm run dev
```

**What you'll see:**
```
▲ Next.js 16.1.6
- Local:        http://localhost:3001
- Environments: .env.local

✓ Starting...
✓ Ready in 2.3s
```

**This means:**
- ✅ The frontend is running!
- ✅ You can access it at http://localhost:3001
- ✅ The server will keep running until you stop it

---

### Step 5: Open the Application in Your Browser

1. **Open your web browser** (Chrome, Firefox, Safari, Edge, etc.)
2. **Go to:** http://localhost:3001
3. **You should see:** The Warm Connection & Playbook application!

**If the page doesn't load:**
- Make sure the server is still running in your terminal
- Check that you're going to the correct URL: http://localhost:3001
- Try refreshing the page
- Check that your backend server is also running (on port 3000)

---

## 🎨 What You Should See

When the application loads, you should see:
- A clean, modern interface
- An input field to enter a company domain
- A "Generate Playbook" button (or similar)

---

## 🛑 Stopping the Server

When you're done using the application:

1. **Go to the terminal window** where the frontend is running
2. **Press:** `Ctrl + C` (Windows/Linux) or `Command + C` (Mac)
3. **You'll see:** The server stops and you get your command prompt back

To start it again, just run `npm run dev` again!

---

## 📁 Project Structure

Here's what's in the `client` folder:

```
client/
├── app/                    # Application pages and routes
│   ├── page.tsx           # Home page
│   ├── result/            # Result page
│   │   └── page.tsx
│   └── job/[id]/          # Job status page
│       └── page.tsx
├── components/            # Reusable UI components
│   ├── ResultView.tsx    # Shows playbook results
│   └── LoadingState.tsx  # Loading animation
├── lib/                   # Utility functions
│   └── api.ts            # API communication functions
├── public/               # Static files (images, etc.)
├── .env.local           # Your environment variables (you created this!)
├── package.json         # Project dependencies and scripts
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

---

## 🔧 Available Commands

You can run these commands in the `client` folder:

### `npm run dev`
- **What it does:** Starts the development server
- **When to use:** When you want to run the application locally
- **URL:** http://localhost:3001

### `npm run build`
- **What it does:** Creates an optimized production build
- **When to use:** Before deploying to production
- **Output:** Creates a `.next` folder with the built application

### `npm run start`
- **What it does:** Runs the production build
- **When to use:** After running `npm run build`
- **Note:** You must run `npm run build` first!

### `npm run lint`
- **What it does:** Checks your code for errors and style issues
- **When to use:** To make sure your code follows best practices

---

## 🔍 Environment Variables Explained

### `NEXT_PUBLIC_API_BASE`

**What it is:**
- The URL of your backend server
- The frontend makes API calls to this address

**Values:**

| Environment | Value |
|-------------|-------|
| Local Backend | `http://localhost:3000` |
| Deployed Backend | `https://warm-connection-and-playbook-2026.onrender.com` |

**Why `NEXT_PUBLIC_`?**
- In Next.js, variables that start with `NEXT_PUBLIC_` are accessible in the browser
- Variables without this prefix are only available on the server

**How to change it:**
1. Open `.env.local`
2. Change the value after the `=` sign
3. **Important:** Restart the development server (`Ctrl+C`, then `npm run dev` again)

---

## 🐛 Troubleshooting

### Error: "Port 3001 is already in use"

**Problem:** Another application is using port 3001

**Solution 1:** Stop the other application using port 3001

**Solution 2:** Change the port:
1. Open `package.json`
2. Change the `dev` script to:
   ```json
   "dev": "next dev -p 3002"
   ```
3. Run `npm run dev` again
4. The app will now run on http://localhost:3002

---

### Error: "Cannot find module ..."

**Problem:** Dependencies are not installed properly

**Solution:**
1. Delete the `node_modules` folder
2. Delete `package-lock.json` file
3. Run `npm install` again

---

### Error: "NEXT_PUBLIC_API_BASE is not defined"

**Problem:** Environment variables file is not set up correctly

**Solution:**
1. Make sure `.env.local` exists in the `client` folder
2. Make sure it contains: `NEXT_PUBLIC_API_BASE=http://localhost:3000`
3. Restart the development server (stop with `Ctrl+C`, then run `npm run dev` again)

---

### Error: "Failed to fetch" or API errors

**Problem:** The frontend can't connect to the backend

**Solution:**
1. Make sure the backend server is running on port 3000
2. Check your `.env.local` file has the correct backend URL
3. Try opening http://localhost:3000/health in your browser
   - If you see `{"status":"ok"}`, the backend is working
   - If you see an error, start the backend server

---

### Page shows but no data loads

**Problem:** The frontend and backend aren't communicating

**Check these:**
1. ✅ Backend server is running (`npm start` in the `server` folder)
2. ✅ Backend is accessible at http://localhost:3000/health
3. ✅ `.env.local` has the correct `NEXT_PUBLIC_API_BASE` value
4. ✅ You restarted the frontend after changing `.env.local`
5. ✅ No CORS errors in the browser console (press F12 to open)

---

### TypeScript errors in terminal

**Problem:** Code has type errors

**What to do:**
- These are usually just warnings during development
- The app should still work
- If the app doesn't work, read the error message carefully
- Most common fix: Run `npm install` again

---

## 🌐 Browser Developer Tools

To see what's happening behind the scenes:

1. **Open your browser**
2. **Press F12** (or right-click anywhere and select "Inspect")
3. **Click the "Console" tab**

Here you can see:
- ✅ Success messages from API calls
- ❌ Error messages if something goes wrong
- 📊 Network requests (in the "Network" tab)

**Tip:** Keep this open while developing to catch errors early!

---

## 📱 Testing on Mobile

Want to test on your phone?

1. **Make sure your phone and computer are on the same WiFi network**
2. **Find your computer's IP address:**
   - Windows: Open Command Prompt, type `ipconfig`, look for "IPv4 Address"
   - Mac: Open Terminal, type `ifconfig | grep inet`
3. **On your phone's browser, go to:** `http://[YOUR-IP]:3001`
   - Example: `http://192.168.1.100:3001`

---

## 🚀 Deploying to Production

When you're ready to deploy:

### Option 1: Vercel (Easiest)

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub
3. **Click:** "New Project"
4. **Import** your repository
5. **Set environment variable:**
   - Key: `NEXT_PUBLIC_API_BASE`
   - Value: `https://warm-connection-and-playbook-2026.onrender.com`
6. **Click:** "Deploy"

That's it! Vercel will build and deploy your application.

### Option 2: Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Your own server

Just make sure to:
1. Run `npm run build`
2. Set the `NEXT_PUBLIC_API_BASE` environment variable
3. Serve the `.next` folder

---

## 📞 Need Help?

If you're stuck:

1. **Check the main setup guide:** [../SETUP.md](../SETUP.md)
2. **Check the backend setup guide:** [../server/SETUP.md](../server/SETUP.md)
3. **Try the deployed version:** https://warm-connection-and-playbook-2026-m2mp6ja67.vercel.app/
4. **Open an issue** in the repository

---

## ✅ Quick Checklist

Before asking for help, make sure:

- [ ] Node.js is installed (`node --version` works)
- [ ] npm is installed (`npm --version` works)
- [ ] You're in the `client` folder (`pwd` or `cd` shows the right path)
- [ ] Dependencies are installed (`node_modules` folder exists)
- [ ] `.env.local` file exists and has correct values
- [ ] Backend server is running on port 3000
- [ ] Frontend server is running on port 3001
- [ ] No errors in the terminal
- [ ] Browser console shows no errors (F12 → Console tab)

---

## 🎉 Success!

Once everything is working:
- ✅ The application loads at http://localhost:3001
- ✅ You can enter a company domain
- ✅ The application communicates with the backend
- ✅ Results load and display correctly

Happy developing! 🚀
