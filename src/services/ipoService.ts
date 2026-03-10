/**
 * IPO data - ipoalerts.in API (requires API key)
 * Set IPO_ALERTS_API_KEY in .env.local
 */

const IPO_BASE = "https://api.ipoalerts.in";

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

export async function fetchIpos(): Promise<{
  upcoming: IpoItem[];
  open: IpoItem[];
  closed: IpoItem[];
}> {
  const key = process.env.IPO_ALERTS_API_KEY;
  if (!key) {
    return { upcoming: [], open: [], closed: [] };
  }

  try {
    const [upcomingRes, openRes, closedRes] = await Promise.all([
      fetch(`${IPO_BASE}/ipos?status=upcoming&limit=20`, {
        headers: { "x-api-key": key },
      }),
      fetch(`${IPO_BASE}/ipos?status=open&limit=20`, {
        headers: { "x-api-key": key },
      }),
      fetch(`${IPO_BASE}/ipos?status=closed&limit=20`, {
        headers: { "x-api-key": key },
      }),
    ]);

    const toItems = (json: { ipos?: unknown[] }) =>
      (json.ipos ?? []).map((i: Record<string, unknown>) => ({
        id: i.id as string,
        name: (i.name ?? i.companyName ?? "") as string,
        symbol: (i.symbol ?? "") as string,
        type: i.type as string,
        priceBand: i.priceBand as string,
        openDate: (i.openDate ?? i.biddingStart) as string,
        closeDate: (i.closeDate ?? i.biddingEnd) as string,
        status: i.status as string,
        listedPrice: i.listedPrice as number,
      }));

    const [upcoming, open, closed] = await Promise.all([
      upcomingRes.json().then(toItems),
      openRes.json().then(toItems),
      closedRes.json().then(toItems),
    ]);

    return { upcoming, open, closed };
  } catch (e) {
    console.warn("IPO fetch failed:", e);
    return { upcoming: [], open: [], closed: [] };
  }
}
