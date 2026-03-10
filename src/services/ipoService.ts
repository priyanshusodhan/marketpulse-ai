/**
 * IPO data service for ipoalerts.in
 * Free-plan safe: low request volume + server cache.
 */

const IPO_BASE = "https://api.ipoalerts.in";
const IPO_CACHE_TTL_MS = 10 * 60 * 1000;
const IPO_RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000;

type IpoStatus = "upcoming" | "open" | "closed";

export interface IpoItem {
  id?: string;
  name: string;
  symbol: string;
  type?: string;
  priceBand?: string;
  openDate?: string;
  closeDate?: string;
  status?: string;
  listedPrice?: number;
}

export interface FetchIposResult {
  upcoming: IpoItem[];
  open: IpoItem[];
  closed: IpoItem[];
  apiConfigured: boolean;
  error?: string;
}

let cachedIpos: FetchIposResult | null = null;
let cachedAt = 0;
let rateLimitedUntil = 0;
let inflight: Promise<FetchIposResult> | null = null;

function toItems(json: unknown): IpoItem[] {
  const source = Array.isArray(json)
    ? json
    : (json as { ipos?: unknown[]; data?: unknown[]; results?: unknown[] } | null)?.ipos ??
      (json as { ipos?: unknown[]; data?: unknown[]; results?: unknown[] } | null)?.data ??
      (json as { ipos?: unknown[]; data?: unknown[]; results?: unknown[] } | null)?.results ??
      [];

  if (!Array.isArray(source)) return [];

  return source.map((raw) => {
    const i = raw as Record<string, unknown>;
    return {
      id: i.id as string,
      name: (i.name ?? i.companyName ?? "") as string,
      symbol: (i.symbol ?? "") as string,
      type: i.type as string,
      priceBand: i.priceBand as string,
      openDate: (i.openDate ?? i.biddingStart) as string,
      closeDate: (i.closeDate ?? i.biddingEnd) as string,
      status: i.status as string,
      listedPrice: i.listedPrice as number,
    };
  });
}

async function fetchStatus(
  status: IpoStatus,
  key: string,
): Promise<{ statusType: IpoStatus; items: IpoItem[]; statusCode: number; detail?: string }> {
  // Free-plan compatibility: avoid unsupported pagination params.
  const url = `${IPO_BASE}/ipos?status=${status}`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": key,
      "api-key": key,
    },
    cache: "no-store",
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const detail =
      (json as { message?: string; error?: string; detail?: string } | null)?.message ||
      (json as { message?: string; error?: string; detail?: string } | null)?.error ||
      (json as { message?: string; error?: string; detail?: string } | null)?.detail ||
      (text ? text.slice(0, 240) : `HTTP ${res.status}`);
    return { statusType: status, items: [], statusCode: res.status, detail };
  }

  return { statusType: status, items: toItems(json), statusCode: res.status };
}

async function loadIpos(key: string): Promise<FetchIposResult> {
  const [upcomingRes, openRes, closedRes] = await Promise.all([
    fetchStatus("upcoming", key),
    fetchStatus("open", key),
    fetchStatus("closed", key),
  ]);

  const all = [upcomingRes, openRes, closedRes];

  const had429 = all.some((r) => r.statusCode === 429);
  if (had429) {
    rateLimitedUntil = Date.now() + IPO_RATE_LIMIT_COOLDOWN_MS;
    if (cachedIpos) {
      return { ...cachedIpos, error: "IPO API rate limit reached (HTTP 429). Showing cached data." };
    }
    return {
      upcoming: [],
      open: [],
      closed: [],
      apiConfigured: true,
      error: "IPO API rate limit reached (HTTP 429). Try again in a few minutes.",
    };
  }

  const isFreePlanUnsupported = (r: { statusCode: number; detail?: string; statusType: IpoStatus }) =>
    r.statusCode === 400 &&
    (r.detail ?? "").toLowerCase().includes("not supported for free plan");

  const errors = all
    .filter((r) => r.statusCode >= 400 && !isFreePlanUnsupported(r))
    .map((r) => r.detail)
    .filter(Boolean) as string[];

  const result: FetchIposResult = {
    upcoming: upcomingRes.items,
    open: openRes.items,
    closed: closedRes.items,
    apiConfigured: true,
    error: errors.length > 0 ? errors.join(" | ") : undefined,
  };

  cachedIpos = result;
  cachedAt = Date.now();
  return result;
}

export async function fetchIpos(): Promise<FetchIposResult> {
  if (cachedIpos && Date.now() - cachedAt < IPO_CACHE_TTL_MS) {
    return cachedIpos;
  }

  const key = process.env.IPO_ALERTS_API_KEY || process.env.STOCKIPOALERT_API_KEY;
  if (!key) {
    return {
      upcoming: [],
      open: [],
      closed: [],
      apiConfigured: false,
      error: "Missing IPO API key",
    };
  }

  if (Date.now() < rateLimitedUntil) {
    if (cachedIpos) {
      return { ...cachedIpos, error: "IPO API rate limit reached (HTTP 429). Showing cached data." };
    }
    return {
      upcoming: [],
      open: [],
      closed: [],
      apiConfigured: true,
      error: "IPO API rate limit reached (HTTP 429). Try again in a few minutes.",
    };
  }

  if (!inflight) {
    inflight = loadIpos(key).finally(() => {
      inflight = null;
    });
  }

  try {
    return await inflight;
  } catch {
    if (cachedIpos) {
      return { ...cachedIpos, error: "IPO API temporarily unavailable. Showing cached data." };
    }
    return {
      upcoming: [],
      open: [],
      closed: [],
      apiConfigured: true,
      error: "IPO fetch failed",
    };
  }
}
