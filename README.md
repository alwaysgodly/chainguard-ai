<div align="center">

# ⛓️ ChainGuard AI
### Intelligent Blockchain Platform
**Education · Analytics · NFT Risk · AI Assistant**

![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)
![Phase](https://img.shields.io/badge/phase-2%20complete-22c55e?style=flat-square)
![Built With](https://img.shields.io/badge/built%20with-React%20·%20Node.js%20·%20Python-8b5cf6?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-f97316?style=flat-square)
![Build In Public](https://img.shields.io/badge/building-in%20public-3b82f6?style=flat-square)

> *Blockchain made simple, safe, and smart.*

</div>

---

## 🧭 What is ChainGuard AI?

ChainGuard AI is an all-in-one intelligent blockchain platform. There's no single place that combines blockchain **education**, **live market analytics**, **AI-powered NFT risk detection**, and a **blockchain-specialized AI assistant** — so I built one.

Built fully in public by a student developer. Follow the journey on [LinkedIn →](https://linkedin.com/in/alwaysgodly)

---

## ✨ Features

### 📊 Command Center Dashboard
- Live coin price cards with sparklines (BTC, ETH, SOL, BNB) via CoinGecko
- Real-time market cap, 24h volume, BTC dominance stats
- Activity feed + personal progress tracking

### 📈 Market Analytics
- Full price charts with timeframe selector (1D / 1W / 1M / 3M / 1Y)
- Fear & Greed Index with animated gauge + 30-day trend line
- Market dominance bars · 24h volume bar chart
- Searchable coin table with live 24h / 7d change columns

### 🛡️ NFT Risk Scanner
- Enter any NFT name or contract address to scan
- AI evaluates across **6 risk dimensions**:
  - Contract Safety · Metadata Integrity · Trading Patterns
  - Creator Reputation · Royalty Structure · Liquidity Risk
- 0–100 risk score with animated SVG score ring + radar chart
- Scan history saved to PostgreSQL per user

### 📚 Blockchain Academy
- 6 learning modules — Blockchain Basics → Real-World Use Cases
- 30 quiz questions · quiz scores tracked to PostgreSQL
- 16-term glossary · staggered animations · progress tracking

### 🤖 AI Assistant
- Full chat UI with markdown rendering (bold, bullets, tables, code blocks)
- Session management — create, list, delete chat sessions
- Messages persisted to PostgreSQL per session
- AI responses via backend proxy *(GPT-4o RAG in Phase 3)*

### 🔐 Auth System
- Login & Register with JWT (access + refresh tokens)
- Auto token refresh on 401 · protected routes
- Zustand global auth store with localStorage persistence

---

## 🏗️ Architecture

```
Frontend (Vite :3000)
    └── /api proxy
         └── Backend (Express :5000)
                  ├── PostgreSQL (auth, progress, scans, chat)
                  ├── CoinGecko API (cached 5 min)
                  └── Fear & Greed API

chainguard-ai/
├── frontend/              # React 18 + TypeScript + Tailwind + Vite
│   └── src/
│       ├── components/    # Layout, Sidebar, Header, ProtectedRoute
│       ├── pages/         # Dashboard, Education, Analytics, NFTScanner, ChatBot, Auth
│       ├── services/      # api.ts (axios + JWT interceptors)
│       ├── store/         # Zustand auth store
│       └── types/         # Shared TypeScript interfaces
│
├── backend/               # Node.js + Express API gateway
│   └── src/
│       ├── controllers/   # auth, analytics, education, nft, chat
│       ├── routes/        # Express route definitions
│       ├── middleware/     # JWT auth, rate limiting, error handling
│       ├── services/      # CoinGecko service (5-min cache)
│       └── config/        # db.ts, jwt.ts, logger.ts
│   └── sql/
│       ├── init.sql       # 10-table schema with indexes
│       └── seed-education.sql  # 6 modules, 30 lessons, 30 quiz questions
│
└── ai-service/            # Python + FastAPI (Phase 3)
    └── src/
        ├── nft_risk/      # XGBoost ML risk pipeline
        └── chatbot/       # LangChain + FAISS + GPT-4o RAG
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript · Tailwind CSS · Vite |
| State | Zustand · TanStack Query |
| Charts | Recharts |
| Routing | React Router v6 |
| HTTP Client | Axios (JWT interceptors + auto-refresh) |
| Backend | Node.js · Express · Socket.io |
| AI/ML Service | Python · FastAPI · LangChain · XGBoost *(Phase 3)* |
| Database (SQL) | PostgreSQL 15 |
| Database (NoSQL) | MongoDB *(Phase 3)* |
| Cache | In-memory (Redis in Phase 4) |
| Auth | JWT · bcrypt · access + refresh token rotation |
| Deployment *(Phase 4)* | Docker · Nginx |

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login + get JWT tokens |
| POST | `/refresh` | Public | Rotate access/refresh tokens |
| POST | `/logout` | 🔒 JWT | Invalidate refresh token |
| GET | `/me` | 🔒 JWT | Get current user |

### Analytics (`/api/analytics`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/coins` | Public | Live coin prices (CoinGecko, 5-min cache) |
| GET | `/coins/:id/chart` | Public | Price history for charts |
| GET | `/global` | Public | Total market cap, BTC dominance |
| GET | `/fear-greed` | Public | Fear & Greed Index (30 days) |

### Education (`/api/education`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/modules` | Public | All 6 modules |
| GET | `/modules/:id` | Public | Module + lessons |
| GET | `/modules/:id/quiz` | Public | Quiz questions (no answers) |
| POST | `/modules/:id/quiz/submit` | 🔒 JWT | Submit answers, save score |
| POST | `/progress` | 🔒 JWT | Save lesson completion |
| GET | `/progress` | 🔒 JWT | Get user progress from PostgreSQL |

### NFT Scanner (`/api/nft`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/scan` | 🔒 JWT | Scan NFT — 6 risk factors, saved to DB |
| GET | `/history` | 🔒 JWT | User scan history |
| GET | `/stats` | Public | Platform-wide scan stats |

### Chat (`/api/chat`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/sessions` | 🔒 JWT | Create chat session |
| GET | `/sessions` | 🔒 JWT | List all sessions |
| DELETE | `/sessions/:id` | 🔒 JWT | Delete session |
| GET | `/sessions/:id/messages` | 🔒 JWT | Get messages |
| POST | `/sessions/:id/messages` | 🔒 JWT | Send message + AI response |

---

## 🚀 Getting Started (Windows)

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- [Python 3.11+](https://python.org)
- [PostgreSQL 15](https://postgresql.org)

### 1. Clone & Install

```bash
git clone https://github.com/alwaysgodly/chainguard-ai.git
cd chainguard-ai

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# AI Service (Phase 3)
cd ../ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup

Open pgAdmin → create `chainguard` database → open Query Tool → run:
```bash
# Run both SQL files in order
backend/sql/init.sql          # creates all tables
backend/sql/seed-education.sql  # seeds 6 modules, 30 lessons, 30 quiz questions
```

### 3. Environment Variables

```bash
cp frontend/.env.example  frontend/.env
cp backend/.env.example   backend/.env
# Fill in: DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET
```

Key variables:
```env
# frontend/.env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000

# backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chainguard
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### 4. Run All Services

Open **3 terminals** in VS Code:

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev          # http://localhost:3000

# Terminal 2 — Backend
cd backend && npm run dev           # http://localhost:5000

# Terminal 3 — AI Service (Phase 3)
cd ai-service
.venv\Scripts\activate
uvicorn src.main:app --reload --port 8000
```

### 5. Verify

```
GET http://localhost:5000/health  →  { "status": "ok" }
```

Visit `http://localhost:3000` → Register → explore all pages with live data.

---

## 🗺️ Roadmap

| Phase | Status | What was built |
|-------|--------|----------------|
| **Phase 1** — Frontend | ✅ Complete | 7 pages · Design system · Auth UI · 4,200+ lines |
| **Phase 2** — Backend + Integration | ✅ Complete | JWT auth · PostgreSQL · CoinGecko live data · NFT scanning · Chat sessions · All 7 pages connected |
| **Phase 3** — AI Services | 🔄 In Progress | XGBoost NFT risk model · GPT-4o RAG chatbot · LangChain + FAISS |
| **Phase 4** — DevOps | ⏳ Planned | Docker · Redis · WebSocket price feeds · deployment |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Display font | Syne (700–900) |
| Body font | DM Sans (300–600) |
| Mono font | JetBrains Mono |
| Base background | `#040810` |
| Primary | `#3b82f6` |
| Accent | `#8b5cf6` |
| Theme | Dark deep-space · glassmorphic cards · staggered animations|

---

## 📄 License

MIT © 2026 — Built in public by [Pushkraj](https://www.linkedin.com/in/pushkraj-vyavahare-0b2332290/)