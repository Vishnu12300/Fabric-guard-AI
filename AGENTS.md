# FABRIC GUARD AI - Project Documentation

## Overview
FABRIC GUARD AI is an industrial-grade fabric defect detection system. It leverages the power of Google Gemini AI to identify common fabric issues such as stains, holes, and broken yarns.

## Features
- **Live Camera**: Real-time analysis using WebRTC.
- **Image Upload**: Batch or single image analysis from local storage.
- **AI Engine**: Powered by Gemini 3 Flash for fast and accurate classification.
- **Secure Dashboard**: Simple authentication to protect the inspection interface.

## Project Structure
- `server.ts`: Express server with Vite middleware.
- `src/App.tsx`: Main application logic and UI.
- `src/services/fabricService.ts`: Gemini API integration for fabric analysis.
- `src/lib/utils.ts`: Tailwind CSS utility functions.

## How to Run
1. Ensure `GEMINI_API_KEY` is set in your environment.
2. Run `npm run dev` to start the development server.
3. Open `http://localhost:3000` in your browser.

## AI Classification Categories
- **Stain**: Discolorations or spots.
- **Hole**: Physical tears or missing fabric.
- **Broken yarn**: Snags or weave irregularities.
- **No defect**: Perfect fabric condition.
- **Not fabric**: Non-fabric objects detected.
