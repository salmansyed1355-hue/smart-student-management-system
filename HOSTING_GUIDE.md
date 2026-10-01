# Hosting & Deployment Guide

This guide provides step-by-step instructions to host the **Smart Student Management System** on popular cloud platforms.

---

## ⚡ Quick Hosting Checklist (Before You Deploy)

1. **MongoDB Atlas IP Whitelist (Critical)**:
   - Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
   - Go to **Security** → **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) and click **Confirm**.
   *(Cloud providers like Render, Vercel, and Railway use dynamic IP addresses, so `0.0.0.0/0` is necessary for your database connection to succeed).*

2. **Database User Credentials**:
   - Ensure your database user has read/write privileges in Atlas (**Database Access** tab).
   - Keep your MongoDB connection URI handy.

---

## 🚀 Option 1: Unified Full-Stack Hosting on Render (Recommended)

In this approach, the Express server serves both the REST API and the built React frontend application from a **single URL**. This eliminates CORS setup and allows you to run on Render's free tier with a single web service.

### Step-by-Step Instructions:

1. Push your repository to **GitHub** or **GitLab**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
3. Select your repository.
4. Configure the service settings:
   - **Name**: `smart-student-management-system` (or your preferred name)
   - **Region**: Choose the closest region (e.g., Singapore or Oregon)
   - **Branch**: `main` (or your primary branch)
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode & static serving |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `your_strong_secret_key` | Random secret key for JWT authentication |
   | `PORT` | `10000` | (Render sets this automatically, default is fine) |
6. Click **Deploy Web Service**.
7. Once deployed, visit your Render URL (e.g. `https://smart-student-management-system.onrender.com/`). The app will load automatically!

> **Health Check**: Render will automatically verify the `/api/health` endpoint.

---

## 🌐 Option 2: Decoupled Hosting (Frontend on Vercel + Backend on Render/Railway)

If you prefer deploying the frontend and backend as two independent services:

### Part A: Deploy the Backend (API) on Render / Railway

1. In Render, create a **Web Service** pointing to your repository.
2. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `MONGO_URI`: `your_mongodb_connection_string`
   - `JWT_SECRET`: `your_random_jwt_secret`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app` (your Vercel URL)
4. Note your backend URL (e.g., `https://sms-api.onrender.com`).

### Part B: Deploy the Frontend on Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New...** → **Project**.
2. Import your GitHub repository.
3. In project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://sms-api.onrender.com` (Your deployed backend URL)
5. Click **Deploy**.
6. The included `client/vercel.json` already contains SPA rewrites so page reloads work smoothly.

---

## 🐳 Option 3: Docker / Container Deployment (Railway, Fly.io, DigitalOcean, VPS)

A multi-stage production `Dockerfile` is included at the root of the project.

### Local Docker Build & Run:
```bash
# 1. Build the Docker image
docker build -t smart-student-system .

# 2. Run the container
docker run -p 5000:5000 \
  -e MONGO_URI="your_mongodb_atlas_uri" \
  -e JWT_SECRET="your_jwt_secret" \
  -e NODE_ENV="production" \
  smart-student-system
```
Access the application at `http://localhost:5000`.

### Deploying to Railway:
1. Create a new project on [Railway.app](https://railway.app/).
2. Connect your GitHub repository.
3. Railway detects the `Dockerfile` automatically.
4. Set the environment variables (`MONGO_URI`, `JWT_SECRET`) in Railway's dashboard.
5. Railway provides an HTTPS domain automatically.

---

## 🛠️ Verification & Seed Data

Once hosted, you can verify your deployment:

1. **API Health Check**:
   Visit: `https://<YOUR_DEPLOYED_URL>/api/health`
   Expected response:
   ```json
   {
     "success": true,
     "message": "Smart Student Management System API is running",
     "database": "connected",
     "environment": "production",
     "uptime": "120s"
   }
   ```

2. **Seeding Sample Students (Optional)**:
   If your database is empty and you want to populate it with 100 sample students:
   - Open a one-off console on your host (Render Shell, Railway CLI, or local machine with the prod `MONGO_URI` in `server/.env`).
   - Run:
     ```bash
     cd server && npm run seed:students
     ```

3. **Default Admin / Faculty Access**:
   - You can sign up a new account as **Faculty** or **Student** directly from the UI.
   - For demo accounts or tests, sign up with any email, select your role, and log in!
