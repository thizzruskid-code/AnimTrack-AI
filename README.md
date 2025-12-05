# AnimTrack AI - Project Documentation

## 1. Project Overview & Current Status
**AnimTrack AI** is an intelligent asset tracking interface for animation production. It uses **Google Gemini AI** to organize unstructured inputs (rough notes, storyboard sketches) into a structured production database (Scene ID, Shot ID, Prompts, Lip Sync).

### **Current Architecture (Phase 1 - Complete)**
*   **Frontend:** React (Single Page Application).
*   **Storage:** **IndexedDB** (Browser-based Database).
    *   *Status:* Data **persists** if you close and reopen the browser.
    *   *Limitation:* Data lives inside the browser. If you "Clear Browsing Data" or switch computers, the data is gone. Video files are stored as Base64 text, which limits performance for very large files.
*   **AI Integration:** Google Gemini 2.5 Flash via `@google/genai` SDK.

---

## 2. File Manifest (The Codebase)

### **Core Logic**
*   **`App.tsx`**: The main controller. Handles state, inputs, drag-and-drop, and coordinates the "Analyze" workflow. It now includes logic for **Smart Dropdowns** (Project/Episode history) and **Batch Processing** (looping through multiple images).
*   **`services/geminiService.ts`**: The AI translator. Sends text/images to Gemini and enforces a strict JSON schema for the response (ensuring we always get `sceneId`, `shotId`, `prompt`, etc.).
*   **`services/storageService.ts` (NEW)**: Handles saving/loading data to `IndexedDB`. This is why your data doesn't disappear on refresh.
*   **`types.ts`**: TypeScript definitions. Defines the shape of an `AnimationEntry`.

### **UI Components**
*   **`components/AssetTable.tsx`**: The spreadsheet view. Includes the **Video Player Modal** logic and handles display of thumbnails and tags.
*   **`components/EditModal.tsx` (NEW)**: A dedicated popup form for editing asset details without deleting/re-creating them. Supports video file uploads.
*   **`components/Button.tsx`**: Reusable button styles.

---

## 3. Roadmap: Needs to Finish Properly

To evolve this from a "Browser Utility" to a "Professional Production Tool", the following phases are required.

### **Phase 2: The Backend (Critical for File Safety)**
*   **Goal:** Save data to your actual hard drive (`C:\AnimationProjects\`) instead of the browser.
*   **Why:** Browser storage can be wiped accidentally. Large video files slow down the browser database.
*   **Implementation:** Requires a **Node.js Express Server**.
*   *See "Prompt A" below to build this.*

### **Phase 3: ComfyUI Automation**
*   **Goal:** Automatically detect when ComfyUI finishes a render.
*   **Why:** Manual upload is slow. The app should "watch" your ComfyUI output folder.
*   **Implementation:** The Node.js server (from Phase 2) needs a "File Watcher" (using `chokidar`).

### **Phase 4: True Google Sheets Integration**
*   **Goal:** Click one button to send data to a real Google Sheet URL, rather than Copy-Pasting.
*   **Why:** Copy-Paste is manual. An API connection keeps the sheet live-updated.
*   **Implementation:** Requires a Google Cloud Service Account and the `google-spreadsheet` NPM package on the backend.
*   *See "Prompt B" below to build this.*

---

## 4. Prompts for Development (Copy/Paste to AI)

Use these prompts to have ChatGPT or Claude build the remaining pieces for you.

### **Prompt A: Build the Local Backend (Phase 2)**
> "I have a React frontend (AnimTrack AI) that currently saves data to IndexedDB. I need to move this to a local file system storage.
>
> **Please write a Node.js Express Server (`server.js`) that does the following:**
> 1.  Runs on port 3001.
> 2.  Provides a POST endpoint `/api/save` that receives the entire JSON asset list and writes it to a file named `database.json` in the project root.
> 3.  Provides a GET endpoint `/api/load` that reads `database.json` and returns the data.
> 4.  **Crucial:** Create a `/uploads` folder. When the frontend uploads a video file (Multipart/Form-Data), save the `.mp4` file to disk in this folder, and return the local file path (e.g., `http://localhost:3001/uploads/video123.mp4`) instead of storing base64 strings."

### **Prompt B: Google Sheets API Integration (Phase 4)**
> "I have a JSON array of animation assets (Project, Episode, Scene, Shot, Prompt).
>
> **Please write a Node.js script (to add to my existing server) that:**
> 1.  Uses the `google-spreadsheet` library.
> 2.  Accepts a Google Sheet ID and a Service Account JSON key.
> 3.  Checks if a sheet tab named 'Animation Log' exists (creates it if not).
> 4.  Appends my animation rows to that sheet.
> 5.  Ensures it doesn't create duplicate rows if the `ID` already exists."

---

## 5. Quick Start (Current Version)
1.  **API Key:** Ensure your `.env` file has `API_KEY=your_gemini_key`.
2.  **Run:** `npm start` (or your platform's run command).
3.  **Usage:**
    *   Upload Sketches/Images.
    *   Type notes (Project name, context).
    *   Click **Analyze**.
    *   **Edit** details if needed.
    *   **Upload Video** from ComfyUI when ready.
    *   **Copy for Sheets** to paste into Excel/Google Sheets.
