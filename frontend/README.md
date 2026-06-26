# 🏋️‍♂️ GymRatHub Client Application

GymRatHub is a premium, state-of-the-art all-in-one fitness and workout tracking application. This folder holds the frontend client, built using Next.js 15, Tailwind CSS v4, Framer Motion, and TanStack Query.

---

## 🚀 Setup & Installation

### 1. Prerequisites
*   Node.js (v18.x or later)
*   A running instance of the GymRatHub backend API (booted on `http://localhost:5000`)

### 2. Environment Variables Configuration

Create a `.env.local` file in this directory:
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

Install dependencies and boot the Next.js development server:
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 🛠️ Technology Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Dynamic SSR)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Tokens
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **State Management & Data**: [Zustand](https://zustand-demo.pmnd.rs/) & [TanStack Query v5](https://tanstack.com/query/latest)
*   **Authentication**: [Clerk Auth](https://clerk.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Charts**: [Recharts](https://recharts.org/)

---

## 💎 Design System & Aesthetic Customization

GymRatHub utilizes a high-end, responsive system. Colors and typography are driven by semantic CSS tokens located inside [globals.css](file:///e:/Projects/GymRatHub/frontend/app/globals.css):

*   **Primary Neon Glow**: `#39E609` (Active interactions, active navigation states)
*   **Surface elevations**: Dark mode backgrounds (`#0a0a0a`), layered container surfaces (`#111111`, `#1c1c1c`)
*   **Typography**: Inter (UI / System) paired with Outfit (Display / Headers)
