// Mock data for development - Replace with real API calls

export const INDICES = [
  { symbol: "NIFTY 50", value: 24532.45, change: 1.24, changePercent: 0.51 },
  { symbol: "SENSEX", value: 80234.12, change: 412.34, changePercent: 0.52 },
  { symbol: "BSE", value: 80234.12, change: 412.34, changePercent: 0.52 },
  { symbol: "NSE", value: 24532.45, change: 124.56, changePercent: 0.51 },
];

export const TICKER_STOCKS = [
  { symbol: "RELIANCE", price: 2456.78, change: 1.2 },
  { symbol: "TCS", price: 3654.32, change: -0.8 },
  { symbol: "HDFC", price: 1654.21, change: 0.5 },
  { symbol: "INFY", price: 1456.89, change: 1.1 },
  { symbol: "ICICI", price: 1123.45, change: -0.3 },
  { symbol: "SBIN", price: 756.32, change: 2.1 },
  { symbol: "BHARTI", price: 1234.56, change: 0.9 },
  { symbol: "ITC", price: 456.78, change: -0.5 },
  { symbol: "KOTAK", price: 1789.12, change: 0.7 },
  { symbol: "LT", price: 3456.78, change: 1.4 },
];

export const GAINERS = [
  { symbol: "TATASTEEL", price: 156.45, change: 5.2 },
  { symbol: "HINDALCO", price: 234.56, change: 4.8 },
  { symbol: "JSWSTEEL", price: 456.78, change: 4.2 },
  { symbol: "COALINDIA", price: 345.67, change: 3.9 },
  { symbol: "ONGC", price: 234.56, change: 3.5 },
];

export const LOSERS = [
  { symbol: "WIPRO", price: 456.78, change: -3.2 },
  { symbol: "TECHM", price: 1234.56, change: -2.8 },
  { symbol: "HCLTECH", price: 1456.78, change: -2.5 },
  { symbol: "CIPLA", price: 1234.56, change: -2.2 },
  { symbol: "SUNPHARMA", price: 1456.78, change: -1.9 },
];

export const generateCandleData = (days = 30) => {
  const data = [];
  let price = 100;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const time = Math.floor((now - i * 86400 * 1000) / 1000);
    const change = (Math.random() - 0.48) * 4;
    const open = price;
    price = Math.max(80, Math.min(150, price + change));
    const high = Math.max(open, price) + Math.random() * 2;
    const low = Math.min(open, price) - Math.random() * 2;
    const close = price;
    data.push({ time, open, high, low, close });
  }
  return data;
};

export const generateLineData = (points = 50) => {
  const data = [];
  let value = 100;
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.45) * 5;
    data.push({ x: i, y: Math.max(80, Math.min(150, value)) });
  }
  return data;
};

export const SECTOR_PERFORMANCE = [
  { name: "IT", change: 1.2, color: "#00f5ff" },
  { name: "Banking", change: 0.8, color: "#bf00ff" },
  { name: "Auto", change: -0.5, color: "#0066ff" },
  { name: "Pharma", change: 0.3, color: "#00ff88" },
  { name: "FMCG", change: -0.2, color: "#ff6600" },
  { name: "Metal", change: 2.1, color: "#ffcc00" },
  { name: "Energy", change: 1.5, color: "#ff0066" },
];

export const UPCOMING_IPOS = [
  { name: "TechNova Solutions", priceBand: "₹450-465", open: "2025-03-15", close: "2025-03-17" },
  { name: "GreenEnergy Ltd", priceBand: "₹120-125", open: "2025-03-20", close: "2025-03-22" },
  { name: "FinServe Capital", priceBand: "₹280-295", open: "2025-03-25", close: "2025-03-27" },
];

export const CURRENT_IPOS = [
  { name: "DataFlow Inc", priceBand: "₹200-210", open: "2025-03-01", close: "2025-03-05" },
];

export const CLOSED_IPOS = [
  { name: "CloudTech", priceBand: "₹150-160", listedPrice: "₹175", currentPrice: "₹192" },
  { name: "MediCare Plus", priceBand: "₹80-85", listedPrice: "₹82", currentPrice: "₹95" },
];
