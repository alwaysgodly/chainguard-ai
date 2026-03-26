import axios from 'axios'
import logger from '../config/logger'

const BASE_URL = 'https://api.coingecko.com/api/v3'

// ── Simple in-memory cache ───────────────────────────────────────
interface CacheEntry {
  data: any
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached(key: string): any | null {
  const entry = cache.get(key)
  if (entry && Date.now() < entry.expiresAt) return entry.data
  cache.delete(key)
  return null
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL })
}

// ── API helpers ──────────────────────────────────────────────────
async function fetchCoinGecko(path: string, params: Record<string, any> = {}): Promise<any> {
  const cacheKey = `${path}?${JSON.stringify(params)}`
  const cached = getCached(cacheKey)
  if (cached) {
    logger.debug(`CoinGecko cache hit: ${path}`)
    return cached
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (process.env.COINGECKO_API_KEY && process.env.COINGECKO_API_KEY !== 'your_coingecko_api_key') {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY
  }

  const { data } = await axios.get(`${BASE_URL}${path}`, {
    params,
    headers,
    timeout: 10_000,
  })

  setCache(cacheKey, data)
  return data
}

// ── Exported functions ───────────────────────────────────────────

export async function getCoins(page = 1, perPage = 20) {
  return fetchCoinGecko('/coins/markets', {
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: perPage,
    page,
    sparkline: true,
    price_change_percentage: '24h,7d',
  })
}

export async function getCoinChart(coinId: string, days: string) {
  const data = await fetchCoinGecko(`/coins/${coinId}/market_chart`, {
    vs_currency: 'usd',
    days,
  })
  // Transform to { timestamp, price } array
  return (data.prices || []).map(([timestamp, price]: [number, number]) => ({
    timestamp,
    price,
  }))
}

export async function getGlobalData() {
  const data = await fetchCoinGecko('/global')
  return {
    totalMarketCap: data.data?.total_market_cap?.usd,
    totalVolume: data.data?.total_volume?.usd,
    marketCapPercentage: data.data?.market_cap_percentage,
    activeCryptocurrencies: data.data?.active_cryptocurrencies,
    marketCapChangePercentage24h: data.data?.market_cap_change_percentage_24h_usd,
  }
}

export async function getFearGreedIndex() {
  try {
    // Alternative.me Fear & Greed Index API
    const { data } = await axios.get('https://api.alternative.me/fng/', {
      params: { limit: 30, format: 'json' },
      timeout: 10_000,
    })
    return (data.data || []).map((entry: any) => ({
      value: parseInt(entry.value),
      classification: entry.value_classification,
      timestamp: parseInt(entry.timestamp) * 1000,
    }))
  } catch (err) {
    logger.warn('Fear & Greed API unavailable, returning mock data')
    // Return mock data as fallback
    const now = Date.now()
    return Array.from({ length: 30 }, (_, i) => ({
      value: 40 + Math.floor(Math.random() * 30),
      classification: 'Neutral',
      timestamp: now - (29 - i) * 86400000,
    }))
  }
}
