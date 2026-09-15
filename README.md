# Smart Student Management System (SMS)

A modern, responsive, full-stack Student Management System built for a BTech college project.

---

## Current Status: Phase 1 (Project Foundation)
- [x] Client (React + Vite + Tailwind CSS + Lucide Icons) setup
- [x] Server (Node.js + Express REST API) setup
- [x] Health-check API endpoint (`GET /api/health`)
- [x] Cross-Origin Resource Sharing (CORS) configured
- [ ] Phase 2: MongoDB Atlas connection & Student schema models (Coming next)

---

## Project Structure

```text
student-management-system/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── App.jsx             # Simple modern test homepage
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML shell
│   ├── package.json            # Client dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   └── server.js           # Express app & /api/health route
│   ├── .env                    # Local environment config
│   ├── .env.example            # Sample environment variables
│   └── package.json            # Server dependencies
│
├── .gitignore                  # Ignores node_modules, .env, and dist
└── README.md                   # Project documentation & run guide
```

---

## How to Run Locally

You need two separate terminal windows: one for the backend server and one for the frontend client.

### 1. Start the Backend (Server)

1. Open your terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. (Optional, already installed) Install dependencies:
   ```bash
   npm install
   ```

3. Start the server in development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   *Or for standard production start:*
   ```bash
   npm start
   ```

4. The server will run at:
   - Base URL: `http://localhost:5000`
   - Health Check: `http://localhost:5000/api/health`

---

### 2. Start the Frontend (Client)

1. Open a **second** terminal window and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. (Optional, already installed) Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   - App URL: `http://localhost:5173`

---

## Verification
When both the backend and frontend are running:
1. Navigate to `http://localhost:5173` in your browser.
2. The page will display:
   - **Smart Student Management System**
   - **"Project foundation is working."**
   - A green **Connected (200 OK)** badge confirming that the frontend successfully communicated with the backend at `http://localhost:5000/api/health`.
