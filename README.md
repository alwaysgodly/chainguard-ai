<div align="center">

# ⛓️ ChainGuard AI
### Intelligent Blockchain Platform
**Education · Analytics · NFT Risk · AI Assistant**

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![Phase](https://img.shields.io/badge/phase-1%20complete-22c55e?style=flat-square)
![Built With](https://img.shields.io/badge/built%20with-React%20·%20Node.js%20·%20Python-8b5cf6?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-f97316?style=flat-square)
![Build In Public](https://img.shields.io/badge/building-in%20public-3b82f6?style=flat-square)

> *Blockchain made simple, safe, and smart.*

</div>

---

## 🧭 What is ChainGuard AI?

ChainGuard AI is an all-in-one intelligent blockchain platform. There's no single place that combines blockchain **education**, **live market analytics**, **AI-powered NFT risk detection**, and a **blockchain-specialized AI assistant** — so I built one.

Built fully in public by a student developer. Follow the journey on [LinkedIn →](#)

---

## ✨ Features

### 📊 Command Center Dashboard
- Live coin price cards with mini sparklines (BTC, ETH, SOL, BNB)
- 30-day portfolio performance area chart
- Real-time activity feed with color-coded status indicators
- Quick actions grid + personal progress tracking

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
- 0–100 risk score with animated SVG score ring
- Radar chart visualization + expandable factor breakdown with explanations

### 📚 Blockchain Academy
- 6 learning modules — Blockchain Basics → Real-World Use Cases
- 30 quiz questions with instant feedback, explanations & score rings
- 16-term glossary · Staggered animations · Progress tracking

### 🤖 AI Assistant
- Full chat UI with markdown rendering (bold, bullets, tables, code blocks)
- Typing indicator · Copy / feedback actions per message
- Suggested prompts · Chat history sidebar · Model info panel
- Powered by GPT-4o + RAG *(wired up in Phase 3)*

### 🔐 Auth System
- Login & Register with email/password
- Google · GitHub · Ethereum Wallet sign-in options
- Password strength meter · JWT protected routes
- Zustand global auth store with localStorage persistence

---

## 🏗️ Architecture

```
chainguard-ai/
├── frontend/              # React app
│   └── src/
│       ├── components/    # Layout, Sidebar, Header, ProtectedRoute
│       ├── pages/         # Dashboard, Education, Analytics, NFTScanner, ChatBot, Auth
│       ├── store/         # Zustand global state
│       ├── services/      # Axios API client
│       └── types/         # Shared TypeScript interfaces
│
├── backend/               # Node.js API gateway
│   └── src/
│       ├── routes/        # auth, analytics, education, nft, chat
│       ├── controllers/   # Route handler logic
│       ├── middleware/     # JWT auth, rate limiting, error handling
│       └── config/        # Logger, DB connections
│
├── ai-service/            # Python AI/ML microservices
│   └── src/
│       ├── nft_risk/      # NFT risk evaluation (XGBoost ML pipeline)
│       └── chatbot/       # AI chatbot (LangChain + FAISS + GPT-4o RAG)
│
└── shared/                # Shared type definitions
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript · Tailwind CSS · Vite |
| State | Zustand · TanStack Query |
| Charts | Recharts |
| Routing | React Router v6 |
| Backend | Node.js · Express · Socket.io |
| AI/ML Service | Python · FastAPI · LangChain · XGBoost |
| Database (SQL) | PostgreSQL 15 |
| Database (NoSQL) | MongoDB |
| Cache | Redis 7 |
| Auth | JWT · bcrypt · OAuth (Google / GitHub) |
| Deployment *(Phase 4)* | Docker · Nginx |

---

## 🚀 Getting Started (Windows)

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- [Python 3.11+](https://python.org)
- [PostgreSQL](https://postgresql.org)
- [MongoDB](https://mongodb.com)
- [Redis](https://redis.io) / [Memurai](https://memurai.com) *(Windows Redis alternative)*

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/chainguard-ai.git
cd chainguard-ai

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install

# AI Service
cd ../ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables

```bash
cp frontend/.env.example  frontend/.env
cp backend/.env.example   backend/.env
cp ai-service/.env.example ai-service/.env
# Fill in your API keys
```

### 3. Run All Services

Open **3 terminals** in VS Code:

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — AI Service
cd ai-service
.venv\Scripts\activate
uvicorn src.main:app --reload --port 8000
```

### 4. Open in Browser

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| AI Service Docs | http://localhost:8000/docs |

---

## 🗺️ Roadmap

| Phase | Status | What's being built |
|-------|--------|--------------------|
| **Phase 1** — Frontend | ✅ Complete | 7 pages · Design system · Auth UI · 4,200+ lines |
| **Phase 2** — Backend APIs | 🔄 In Progress | JWT auth · CoinGecko prices · PostgreSQL · user progress |
| **Phase 3** — AI Services | ⏳ Planned | XGBoost NFT risk model · GPT-4o RAG chatbot |
| **Phase 4** — DevOps | ⏳ Planned | Docker · WebSocket price feeds · deployment |

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
| Theme | Dark deep-space · glassmorphic cards · staggered animations |

---

## 📄 License

MIT © 2025 — Built in public by [Pushkraj](https://linkedin.com/in/YOUR_HANDLE)