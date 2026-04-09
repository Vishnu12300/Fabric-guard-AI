# FABRIC GUARD AI - Deployment Guide

## Deploying to Vercel

To deploy this application to Vercel and connect the Gemini API, follow these steps:

### 1. Push to GitHub
Push your code to a GitHub repository.

### 2. Import to Vercel
1. Go to [Vercel](https://vercel.com) and click **"Add New"** > **"Project"**.
2. Import your GitHub repository.

### 3. Configure Environment Variables
This is the most important step to "connect the Gemini API":
1. In the Vercel project settings, go to the **"Environment Variables"** section.
2. Add a new variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API Key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey)).
3. Click **"Save"**.

### 4. Deploy
1. Click **"Deploy"**.
2. Vercel will build the Vite frontend and the serverless API functions.
3. The `vite.config.ts` is already configured to inject the `GEMINI_API_KEY` into the frontend during the build process.

## Local Development
1. Clone the repo.
2. Create a `.env` file and add `GEMINI_API_KEY=your_key`.
3. Run `npm install`.
4. Run `npm run dev`.

## Features
- **Live Camera Detection**: Uses WebRTC to capture frames.
- **Image Upload**: Supports drag-and-drop or file selection.
- **AI Analysis**: Powered by Gemini 3 Flash.
- **Secure Dashboard**: Simple login system.
