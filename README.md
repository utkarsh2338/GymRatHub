# 🏋️‍♂️ GymRatHub — Train Smarter. Live Stronger.

GymRatHub is a premium, state-of-the-art all-in-one fitness and workout tracking application designed for modern athletes. Combining custom workout libraries, real-time analytics, automated nutrition/macro logs, and interactive drag-and-drop planning calendars, GymRatHub puts a personalized personal trainer right in your browser.

Featuring a gorgeous **Neon-Dark Theme** built on custom CSS glassmorphism, fluid animations, and high-performance routing.

---

## ⚡ Key Features

### 🟢 Workout & Exercise Library
*   **10,000+ Exercises**: Filterable by muscle group (chest, back, legs, shoulders, etc.), difficulty level, and available equipment.
*   **Interactive Demos**: Dynamic video demonstrations fetched directly via integration with the YouTube Data API.

### 📅 Drag-and-Drop Workout Planner
*   **Calendar-Based Scheduler**: Plan your training week with ease using a smooth `@dnd-kit` powered interface.
*   **Session Builder**: Combine exercises, set targets (sets/reps/weight), and log active sessions directly.

### 🥗 Nutrition & Meal Tracker
*   **Macro Calculators**: Automated tracking of protein, fats, and carbohydrates based on daily targets.
*   **Dynamic Logs**: Track individual meals, view progress meters, and access custom elite meal plan presets.

### 📈 Progress Analytics & Charts
*   **Visual PR Trackers**: Keep tabs on your progression curves using responsive, beautiful SVG charts powered by `recharts`.
*   **Weight & Body Metrics**: Log daily measurements and visualize trendlines to ensure you stay on course.

### 🤝 Challenges & Leaderboard
*   **Interactive Community**: Compete in weekly workout challenges and view live leaderboard updates.
*   **Premium Memberships**: Free, Pro, and Elite tiers with tiered benefits like 1-on-1 trainer access and advanced nutrition reports.

---

## 🛠️ Technology Stack

GymRatHub is split into a Next.js client application and a TypeScript Express backend.

### Frontend (`/frontend`)
*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Dynamic SSR)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Tokens
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **State Management & Data**: [Zustand](https://zustand-demo.pmnd.rs/) & [TanStack Query v5](https://tanstack.com/query/latest)
*   **Authentication**: [Clerk Auth](https://clerk.com/) (OAuth & SSO redirect flows)
*   **Icons**: [Lucide React](https://lucide.dev/)

### Backend (`/backend`)
*   **Runtime & Language**: Node.js with [TypeScript](https://www.typescriptlang.org/)
*   **Server Framework**: [Express](https://expressjs.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
*   **APIs**: Google YouTube Data API v3 & Clerk Backend SDK

---

## 📂 Project Architecture

```
GymRatHub/
├── backend/
│   ├── src/
│   │   ├── config/       # Database & API clients config
│   │   ├── constants/    # Constants and presets
│   │   ├── middleware/   # Express Auth & CORS filters
│   │   ├── models/       # Mongoose Schemas (User, Workouts, Meals)
│   │   ├── routes/       # Express Route Handlers
│   │   ├── services/     # Third-party integrations (YouTube API)
│   │   └── index.ts      # Server entrance
│   └── package.json
│
├── frontend/
│   ├── app/              # Next.js App Router (Dashboard & Landing groups)
│   │   ├── (landing)/    # Public home and pricing pages
│   │   ├── (dashboard)/  # Main authenticated app space
│   │   ├── auth/         # Dynamic Clerk Sign-in/Sign-up routes
│   │   └── globals.css   # Main CSS design tokens & animations
│   ├── components/       # Modular, reusable React components
│   ├── lib/              # Client API clients, helper utilities
│   └── package.json
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or later)
*   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB database)

### 2. Environment Variables Configuration

#### Backend Setup (`/backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
YOUTUBE_API_KEY=your_youtube_api_key
```

#### Frontend Setup (`/frontend/.env.local`)
Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

### 3. Running Locally

#### Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will boot on `http://localhost:5000`.

#### Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 💎 Design System & Aesthetic Customization

GymRatHub utilizes a high-end, responsive system. Colors and typography are driven by semantic CSS tokens located inside [globals.css](file:///e:/Projects/GymRatHub/frontend/app/globals.css):

*   **Primary Neon Glow**: `#39E609` (Active interactions, active navigation states)
*   **Surface elevations**: Dark mode backgrounds (`#0a0a0a`), layered container surfaces (`#111111`, `#1c1c1c`)
*   **Typography**: Inter (UI / System) paired with Outfit (Display / Headers)

---

## 📈 Verification & Production Build

Ensure everything builds correctly before deploying:
```bash
cd frontend
npm run build
```
This builds an optimized Next.js package, verifying route safety, static assets, and type sanity.
