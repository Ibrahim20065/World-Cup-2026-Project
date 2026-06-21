# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# FIFA World Cup 2026 Predictions App

A full-stack football predictions web app built during the FIFA World Cup 2026.

🌐 **Live:** https://world-cup-2026-858s.vercel.app

---

## Features

- 🎯 **Predictions** — Pick every group, knockout bracket, and award winner
- ⚽ **Match Picks** — Predict exact scores for every group stage match and earn points
- 📊 **Group Standings** — Live tables updated after each match
- 🎯 **Qualification Tracker** — See which teams have advanced or been eliminated
- ⚡ **Live Scores** — Powered by TheSportsDB, updates automatically
- 🏆 **Leaderboard** — Real-time rankings among all users
- 🏅 **Mini Leagues** — Create and join private leagues with invite codes
- 🌍 **Countries** — Explore all 48 squads at the tournament
- 🗺️ **Host Cities** — Discover all 16 stadiums across USA, Mexico and Canada
- ⚙️ **Account Settings** — Change username, email, password and preferences
- 🎨 **Theme Colors** — Pick your accent color
- 📧 **Email Verification** — Secure signup with 6-digit code

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Framer Motion (animations)
- React Router DOM
- Axios
- DnD Kit (drag and drop)
- Tailwind CSS
- Deployed on **Vercel**

**Backend**
- Python + Flask
- PostgreSQL (Railway)
- SQLAlchemy ORM
- JWT Authentication
- SendGrid (email)
- APScheduler (auto-scoring every 5 min)
- Deployed on **Railway**

**APIs**
- TheSportsDB (live scores)
- FlagCDN (country flags)

---

## Points System

| Prediction | Points |
|---|---|
| Correct match result | 2 pts |
| Exact match score | +4 pts bonus |
| Group stage advancement | 5 pts |
| Correct Round of 32 pick | 6 pts |
| Correct Round of 16 pick | 12 pts |
| Correct Quarter Final pick | 18 pts |
| Correct Semi Final pick | 24 pts |
| Correct 3rd Place pick | 27 pts |
| Correct Final winner | 30 pts |
| Golden Ball | 15 pts |
| Silver Ball | 10 pts |
| Bronze Ball | 5 pts |
| Golden Boot / Glove / U21 (1st) | 12 pts |
| Golden Boot / Glove / U21 (2nd) | 8 pts |
| Golden Boot / Glove / U21 (3rd) | 4 pts |

---

## Developed By

**Ibrahim Mohammad** — First full-stack project, built from scratch during FIFA World Cup 2026.

Built with React, Flask, and a lot of late nights. ⚽