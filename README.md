# Smart Student Management System

A full-stack, responsive academic management portal designed for engineering institutions. Built with the MERN stack (MongoDB Atlas, Express.js, React, Node.js), Tailwind CSS, Lucide icons, Recharts, and JWT authentication.

---

## Project Description

The **Smart Student Management System (SMS)** is a web application created to streamline and modernize academic administration. It provides faculty and college administrators with a centralized platform for:
- **Student Information Management**: Complete student records, roll numbers, departments, batch years, contact info, and status tracking.
- **Attendance Management**: Daily attendance recording, subject-wise tracking, bulk "Mark All Present", status filtering (Present, Absent, Late), and student attendance history.
- **Marks & Grading Management**: Exam assessments (Internal, Midterm, Assignment, Final), score tracking, percentage calculations, grade badges, and student academic history.
- **Analytics Dashboard**: Real-time KPI summary cards, interactive attendance and marks distribution charts, top performers, low attendance alerts, and activity feed.
- **User Authentication**: Secure administrative sign up, login, persistent sessions via JSON Web Tokens (JWT), bcrypt password hashing, and route protection.

---

## Features

### 1. User Authentication & Security
- Admin signup and login workflows with full input validation.
- Password hashing using `bcryptjs` with randomized salt before saving to MongoDB Atlas.
- Stateless, signed authentication using JSON Web Tokens (JWT).
- Client-side token storage in `localStorage` with automated verification on page reload.
- Protected frontend pages preventing unauthorized access.
- Secure single-click Logout from both the top header and sidebar.

### 2. Student Directory Module
- Comprehensive table listing student roll number, full name, department, semester, batch year, phone, email, and active status.
- Real-time client-side search by student name or roll number.
- Department-based filtering (Computer Science, Electronics, Mechanical, Civil, Information Technology).
- Modal-based Add Student, Edit Student, View Student details, and Delete Student with confirmation.

### 3. Attendance Management Module
- Daily subject-wise student attendance entry.
- Quick status selection (Present, Absent, Late) with color-coded badges.
- One-click **Mark All Present** for fast batch attendance logging.
- Compound unique index preventing duplicate attendance for the same student, subject, and date.
- Modal displaying individual student attendance percentage and detailed session history.

### 4. Marks & Grading Module
- Score entry for multiple examination types (Internal, Midterm, Assignment, Final).
- Automatic percentage calculation and academic grade assignment (A+, A, B, C, F).
- Compound unique index preventing duplicate mark entries for the same student, subject, and exam type.
- Modal displaying individual student marks breakdown, total marks, and average performance.

### 5. Interactive Dashboard & Analytics
- Live KPI cards: Total Students, Active Students, Departments, Attendance Records, and Marks Logged.
- Real-time attendance percentage and academic performance averages.
- Visual charts powered by Recharts:
  - Department-wise student distribution.
  - Overall attendance rate breakdown.
  - Grade distribution across all subjects.
- Quick lists: Top performing students and low-attendance alerts (< 75%).
- Live backend connection status monitor.

---

## Technology Stack

- **Frontend**:
  - React 19 (Hooks, Context API, state-driven UI)
  - Vite (Fast development and optimized production build)
  - Tailwind CSS (Utility-first responsive styling)
  - Lucide React (Icons)
  - Recharts (Interactive SVG data visualizations)
- **Backend**:
  - Node.js (JavaScript runtime)
  - Express.js (RESTful API framework)
  - Mongoose (Object Data Modeling for MongoDB)
  - CORS (Cross-Origin Resource Sharing)
  - Dotenv (Environment variable management)
- **Database**:
  - MongoDB Atlas (Cloud-hosted NoSQL document database)
- **Authentication**:
  - `bcryptjs` (Cryptographic password hashing)
  - `jsonwebtoken` (JWT creation, signing, and verification)
- **Version Control**:
  - Git & GitHub

---

## Project Architecture

```text
React (Client SPA)
  │
  │ HTTP Requests (JSON + JWT Bearer Token)
  ▼
Express.js REST API (Server)
  │
  ├── authMiddleware (Token extraction & verification)
  ├── Controllers & Route Handlers
  │
  ▼
Mongoose ODM (Schema validation & lifecycle hooks)
  │
  ▼
MongoDB Atlas (Cloud Database Cluster)
```

---

## Folder Structure

```text
student-management-system/
├── client/                              # Frontend React Application
│   ├── public/                          # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── attendance/              # Attendance management components & modals
│   │   │   ├── dashboard/               # Analytics dashboard & charts
│   │   │   ├── layout/                  # Top Header and Sidebar navigation
│   │   │   ├── marks/                   # Marks & grading components & modals
│   │   │   └── students/                # Student directory table & CRUD modals
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # React Context for auth state & token persistence
│   │   ├── pages/
│   │   │   ├── Login.jsx                # Admin Login page
│   │   │   └── Signup.jsx               # Admin Registration page
│   │   ├── services/
│   │   │   └── api.js                   # Centralized API fetch wrapper with Bearer token
│   │   ├── App.jsx                      # App root with protected routing logic
│   │   ├── index.css                    # Tailwind CSS directives
│   │   └── main.jsx                     # React DOM entrypoint
│   ├── package.json
│   └── vite.config.js
│
├── server/                              # Backend Express Application
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # MongoDB Atlas connection setup
│   │   ├── middleware/
│   │   │   └── authMiddleware.js        # JWT Bearer verification middleware
│   │   ├── models/
│   │   │   ├── Attendance.js            # Attendance schema & compound index
│   │   │   ├── Mark.js                  # Mark schema & compound index
│   │   │   ├── Student.js               # Student schema with validation
│   │   │   └── User.js                  # User schema with pre-save bcrypt hook
│   │   ├── routes/
│   │   │   ├── attendanceRoutes.js      # Attendance REST endpoints
│   │   │   ├── authRoutes.js            # Authentication endpoints (signup, login, me)
│   │   │   ├── markRoutes.js            # Marks REST endpoints
│   │   │   └── studentRoutes.js         # Student CRUD REST endpoints
│   │   └── server.js                    # Express app configuration & server startup
│   ├── .env.example                     # Environment template (no secrets)
│   └── package.json
│
├── .gitignore                           # Git ignore rules for node_modules, .env, dist
└── README.md                            # Comprehensive project documentation
```

---

## Database Collections

MongoDB Atlas stores four distinct collections for this system:

| Collection | Schema Model | Purpose | Key Fields |
| :--- | :--- | :--- | :--- |
| **`users`** | `User.js` | Stores administrator accounts for portal login | `name`, `email` (unique), `password` (bcrypt hash), `createdAt` |
| **`students`** | `Student.js` | Stores registered student academic profiles | `rollNumber` (unique), `fullName`, `email`, `phone`, `department`, `semester`, `batchYear`, `status` |
| **`attendances`** | `Attendance.js` | Stores individual attendance sessions | `studentId` (ref: Student), `date`, `subject`, `status` ('Present' \| 'Absent' \| 'Late') |
| **`marks`** | `Mark.js` | Stores student exam scores and evaluations | `studentId` (ref: Student), `subject`, `examType`, `maxMarks`, `obtainedMarks` |

---

## API Endpoints

### System Health
- `GET /api/health` — Returns server status, timestamp, and uptime check.

### Authentication
- `POST /api/auth/signup` — Registers a new administrator, hashes password with bcrypt, and returns a signed JWT token.
- `POST /api/auth/login` — Verifies email and password using bcrypt and returns a signed JWT token.
- `GET /api/auth/me` *(Protected)* — Validates the JWT Bearer token and returns the current user profile (excluding password).

### Students
- `GET /api/students` — Retrieves all registered students.
- `POST /api/students` — Adds a new student with validation.
- `PUT /api/students/:id` — Updates an existing student record by ID.
- `DELETE /api/students/:id` — Deletes a student record by ID.

### Attendance
- `GET /api/attendance` — Retrieves all attendance records with populated student details.
- `POST /api/attendance` — Records a single attendance session (enforces unique student + date + subject).
- `GET /api/attendance/student/:studentId` — Retrieves full attendance history for a specific student.

### Marks & Grades
- `GET /api/marks` — Retrieves all marks records with populated student details.
- `POST /api/marks` — Records an examination score (enforces unique student + subject + exam type).
- `GET /api/marks/student/:studentId` — Retrieves full marks history and computed averages for a specific student.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- A MongoDB Atlas cloud database cluster

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-management-system
```

### 2. Configure Backend Environment Variables
Create a `.env` file inside the `server/` directory:
```bash
cd server
cp .env.example .env
```
Open `server/.env` and supply your MongoDB Atlas connection string and a secret key:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```
*(Never commit `.env` to version control).*

### 3. Install Server Dependencies
```bash
npm install
```

### 4. Install Client Dependencies
Open a new terminal window in the project root:
```bash
cd client
npm install
```

---

## Running Locally

Run both the backend server and frontend client concurrently:

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
- Server starts on `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`

### Terminal 2: Frontend Client
```bash
cd client
npm run dev
```
- Client runs on `http://localhost:5173`
- Open your browser and navigate to `http://localhost:5173`

---

## Authentication Flow

```text
Admin Registration / Login
       │
       ▼
Express API Validation
       │
       ▼
bcrypt Password Hashing / Comparison
       │
       ▼
JWT Signed with JWT_SECRET (7-day validity)
       │
       ▼
Frontend stores Token in localStorage ('sms_token')
       │
       ▼
AuthContext unlocks Protected Dashboard
       │
       ▼
Subsequent API calls attach:
Authorization: Bearer <token>
```

---

## Screenshots

The application includes high-fidelity UI views:
- **Admin Login & Sign Up**: Responsive glassmorphism cards with show/hide password toggles.
- **Analytics Dashboard**: Interactive charts, metric overview cards, and low-attendance indicators.
- **Student Directory**: Paginated, searchable table with action modals.
- **Attendance Tracker**: Subject-wise status badges and instant history inspector.
- **Marks Management**: Grade breakdown and performance summaries.

---

## Future Improvements

Potential enhancements planned for subsequent versions:
1. **Role-Based Access Control (RBAC)**: Distinct permissions for Teachers, Students, and Admins.
2. **Password Reset & Recovery**: Automated email reset links using Nodemailer.
3. **Fee Management Module**: Tracking semester tuition fees, payments, and receipts.
4. **Export to PDF & Excel**: Exporting student report cards and attendance sheets.
5. **Real-time Notifications**: Automated email or SMS alerts for low attendance.

---

## License

This project is open source and created for academic and demonstration purposes.
