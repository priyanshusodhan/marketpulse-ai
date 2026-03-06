# MarketPulse AI

MarketPulse AI is a **futuristic stock-market intelligence dashboard** with a premium glassmorphism UI, live-style charts, AI prediction placeholders, a portfolio tracker, and IPO flows — built with **Next.js App Router + MongoDB**.

## Preview

- **Landing**: neon-gradient background, stock ticker ribbon, cursor glow, animated candlestick overlay, scroll-reveal charts + video
- **Dashboard**: candlestick + trend charts, sector heatmap, gainers/losers
- **Analysis**: technical indicators (RSI/MACD/MA), AI signal + probabilities
- **Portfolio**: holdings + P/L computed from MongoDB data
- **IPO**: mock UPI flow that saves applications to MongoDB

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion
- **Charts**: TradingView Lightweight Charts (candlesticks), Chart.js (trend lines)
- **3D**: Three.js (globe)
- **Backend**: Next.js Route Handlers (Node runtime)
- **Database**: MongoDB (Mongoose)
- **Market Data**: Yahoo Finance (no key), Alpha Vantage (optional)

## Pages

- `/` — Landing (scroll-reveal market visuals + embedded video block)
- `/dashboard` — Live Market Dashboard
- `/analysis` — Stock Analysis
- `/prediction` — AI Price Prediction (placeholder curves)
- `/portfolio` — Portfolio Tracker (MongoDB-backed)
- `/ipo` — IPO section (MongoDB-backed application storage)
- `/insights` — Market Insights
- `/login`, `/signup` — Auth UI screens (NextAuth wiring can be added next)

## API Routes (Backend)

- `GET /api/health` — DB connectivity check
- `GET /api/stock?symbol=RELIANCE&range=1mo` — Stock data (Yahoo Finance → fallback mock)
- `GET /api/portfolio` — Get demo portfolio (MongoDB)
- `POST /api/portfolio` — Update holdings (MongoDB)
- `POST /api/ipo/apply` — Save IPO application (MongoDB)

## Local Setup (recommended)

### 1) Install

```bash
cd /Users/priyanshusodhan20icloud.com/Documents/WEBSITE/marketpulse-ai
npm install
```

### 2) Start MongoDB (Docker)

Make sure Docker Desktop is running, then:

```bash
npm run db:up
```

- MongoDB: `mongodb://localhost:27017`
- Mongo Express UI: `http://localhost:8081`

### 3) Configure environment

Create/edit `.env.local`:

```bash
MONGODB_URI=mongodb://localhost:27017/marketpulse-ai
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_ALPHA_VANTAGE_KEY= # optional
```

### 4) Run

```bash
npm run dev
```

Open `http://localhost:3000`.

### 5) Verify DB connection

Open `http://localhost:3000/api/health` — it should return:

```json
{ "ok": true, "dbConfigured": true, "timestamp": "..." }
```

## Adding your own landing video

The landing page includes an embedded `<video>` section. Add a file here:

- `public/videos/market-loop.mp4`

## Repository structure

```
src/
├── app/                 # App Router pages + route handlers
│   └── api/             # Backend routes
├── components/          # UI components (GlassCard, Navbar, CursorGlow, etc.)
├── charts/              # Candlestick + line charts
├── lib/                 # DB connection helper
├── models/              # Mongoose models
├── services/            # External API wrappers
└── utils/               # Mock data / generators
```

## Notes / Roadmap

- **Auth**: Hook `/portfolio` to real users via NextAuth session (currently demo user id).
- **Real-time**: Add websocket/SSE polling for live prices.
- **AI**: Replace placeholders with a real prediction service (Python or Node inference).

## License

MIT (you can change this if you want).
