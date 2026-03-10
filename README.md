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
- **Market Data**: Yahoo Finance (primary, no key), Alpha Vantage & Finnhub (optional fallbacks), ipoalerts.in (IPO data)

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
MONGODB_URI=mongodb://localhost:27017/marketpulse-ai
NEXTAUTH_URL=http://localhost:3000
IPO_ALERTS_API_KEY=   # optional - for live IPO data from ipoalerts.in
ALPHA_VANTAGE_API_KEY= # optional - fallback
FINNHUB_API_KEY=      # optional - fallback
```

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
- `GET /api/indices` — NIFTY 50, SENSEX, NSE, BSE
- `GET /api/quote?symbol=RELIANCE` or `?symbols=A,B` — Live quotes
- `GET /api/stock?symbol=RELIANCE&range=1D|1W|1M|6M|1Y|5Y` — Candlestick + volume (Yahoo Finance)
- `GET /api/movers` — Gainers / losers
- `GET /api/nifty50` — NIFTY 50 stocks
- `GET /api/sectors` — Sector performance
- `GET /api/ipo` — IPO list (requires `IPO_ALERTS_API_KEY`)
- `GET /api/portfolio` — Portfolio (MongoDB + live prices)
- `POST /api/portfolio` — Update holdings (MongoDB)
- `POST /api/ipo/apply` — IPO application (MongoDB)

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
- **Real-time**: 10-second polling for indices, movers, NIFTY 50, and quotes.
- **Caching**: 45s for quotes, 5min for charts to limit API calls.
- **AI**: Replace placeholders with a real prediction service.

## License

MIT (you can change this if you want).
