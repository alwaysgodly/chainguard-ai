import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, Shield, BookOpen, MessageSquare,
  Activity, ArrowUpRight, ArrowDownRight, Zap, Bell,
  BarChart2, Star, Clock, Wallet, RefreshCw
} from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import api from '@/services/api'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  .dash * { box-sizing: border-box; }
  @keyframes dash-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dash-fade { from{opacity:0} to{opacity:1} }
  @keyframes dash-shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes dash-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes dash-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .dash-up   { animation: dash-up 0.5s cubic-bezier(.4,0,.2,1) both; }
  .dash-fade { animation: dash-fade 0.4s ease both; }
  .dash-shimmer-text {
    background: linear-gradient(90deg,#3b82f6 0%,#8b5cf6 30%,#06b6d4 60%,#3b82f6 100%);
    background-size: 600px 100%;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    animation: dash-shimmer 4s linear infinite;
  }
  .dash-card {
    transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease, border-color 0.28s ease;
  }
  .dash-card:hover { transform: translateY(-3px); }
  .dash-live { animation: dash-pulse 2s ease infinite; }
  .dash-spin { animation: dash-spin 1.5s linear infinite; }
  .dash-grid {
    background-image: linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
    background-size: 36px 36px;
  }
`

// ─── Mock Data ────────────────────────────────────────────────────────────────
const makePriceHistory = (base: number, count = 30) =>
  Array.from({ length: count }, (_, i) => ({
    i,
    v: Math.max(base * 0.85, base + Math.sin(i / 3.5) * base * 0.04 + (Math.random() - 0.47) * base * 0.025 + i * base * 0.001)
  }))

const COINS = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin',  price: 67420,  change24h:  2.34, mktCap: '1.33T', vol: '38.2B', color: '#f97316', history: makePriceHistory(67420) },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 3512,   change24h: -1.12, mktCap: '421B',  vol: '21.4B', color: '#8b5cf6', history: makePriceHistory(3512)  },
  { id: 'sol', symbol: 'SOL', name: 'Solana',   price: 178.4,  change24h:  5.67, mktCap: '81B',   vol: '5.8B',  color: '#06b6d4', history: makePriceHistory(178.4) },
  { id: 'bnb', symbol: 'BNB', name: 'BNB',      price: 412.8,  change24h:  0.89, mktCap: '62B',   vol: '2.1B',  color: '#eab308', history: makePriceHistory(412.8) },
]

const PORTFOLIO_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  value: 10500 + Math.sin(i / 4) * 900 + i * 120 + (Math.random() - 0.45) * 300
}))

const ACTIVITY = [
  { icon: Shield,        label: 'NFT Risk Scan',          detail: 'CryptoPunk #3812 — Low Risk (12)',  time: '2m ago',  dot: '#22c55e' },
  { icon: Bell,          label: 'Price Alert Triggered',  detail: 'ETH crossed $3,500 threshold',     time: '18m ago', dot: '#f59e0b' },
  { icon: BookOpen,      label: 'Module Completed',       detail: 'Consensus Mechanisms · 5/5 quiz',  time: '1h ago',  dot: '#22c55e' },
  { icon: Shield,        label: 'NFT Risk Scan',          detail: 'BAYC #7291 — High Risk (78)',       time: '3h ago',  dot: '#ef4444' },
  { icon: MessageSquare, label: 'AI Chat Session',        detail: 'Asked about DeFi yield strategies', time: '5h ago',  dot: '#6b7280' },
  { icon: TrendingUp,    label: 'Portfolio Alert',        detail: 'BTC position up 8.2% today',       time: '6h ago',  dot: '#22c55e' },
]

const STATS = [
  { label: 'Total Portfolio',    value: '$14,820', sub: '+23.5% this month',  color: '#22c55e', up: true  },
  { label: 'Market Cap (Total)', value: '$2.41T',  sub: '+1.8% vs yesterday', color: '#3b82f6', up: true  },
  { label: '24h Volume',        value: '$94.3B',  sub: '+12.4% vs avg',      color: '#8b5cf6', up: true  },
  { label: 'BTC Dominance',     value: '52.4%',   sub: '-0.3% this week',    color: '#f59e0b', up: false },
]

// ─── Components ───────────────────────────────────────────────────────────────
function MiniChart({ data, color }: { data: { v: number }[], color: string }) {
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.28} />
            <stop offset="95%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#g${color.slice(1)})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const ChartTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0a0d14', border: '1px solid #1e2130', borderRadius: 8, padding: '5px 10px' }}>
      <span style={{ color: '#e2e8f0', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
        ${Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const [mounted, setMounted]   = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [liveTime, setLiveTime] = useState(new Date())
  const [liveCoins, setLiveCoins] = useState(COINS)
  const [liveStats, setLiveStats] = useState(STATS)

  const COIN_COLORS: Record<string,string> = {
    bitcoin:'#f97316', ethereum:'#8b5cf6', solana:'#06b6d4', binancecoin:'#eab308',
  }

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/analytics/coins?per_page=4&sparkline=true')
      const data = res.data.data || []
      if (data.length > 0) {
        setLiveCoins(data.map((c: any) => ({
          id: c.id, symbol: c.symbol?.toUpperCase(), name: c.name,
          price: c.current_price,
          change24h: Number((c.price_change_percentage_24h || 0).toFixed(2)),
          mktCap: c.market_cap >= 1e12 ? `${(c.market_cap/1e12).toFixed(2)}T` : `${(c.market_cap/1e9).toFixed(0)}B`,
          vol: c.total_volume >= 1e9 ? `${(c.total_volume/1e9).toFixed(1)}B` : `${(c.total_volume/1e6).toFixed(0)}M`,
          color: COIN_COLORS[c.id] || '#3b82f6',
          history: (c.sparkline_in_7d?.price || []).map((v: number, j: number) => ({ i: j, v })),
        })))

        // Update total market cap stat
        const totalMcap = data.reduce((s: number, c: any) => s + (c.market_cap || 0), 0)
        const totalVol = data.reduce((s: number, c: any) => s + (c.total_volume || 0), 0)
        setLiveStats(prev => prev.map(s => {
          if (s.label === 'Market Cap (Total)') return { ...s, value: totalMcap >= 1e12 ? `$${(totalMcap/1e12).toFixed(2)}T` : `$${(totalMcap/1e9).toFixed(0)}B` }
          if (s.label === '24h Volume') return { ...s, value: totalVol >= 1e9 ? `$${(totalVol/1e9).toFixed(1)}B` : `$${(totalVol/1e6).toFixed(0)}M` }
          return s
        }))
      }
    } catch (e) { console.error('Dashboard fetch error:', e) }
  }

  useEffect(() => { setMounted(true); fetchDashboardData() }, [])
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData().finally(() => setTimeout(() => setRefreshing(false), 600))
  }

  const f = (n: string) => 'Syne, sans-serif'
  const dm = 'DM Sans, sans-serif'
  const mono = 'JetBrains Mono, monospace'

  return (
    <div className="dash" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{STYLES}</style>

      {/* ── Page Header ── */}
      <div className="dash-up" style={{ animationDelay: '0ms', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={22} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
              Command Center
            </h1>
            <p style={{ color: '#4b5563', fontSize: 12, fontFamily: dm, margin: 0 }}>
              Your live blockchain overview
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: '#0d1117', border: '1px solid #1e2130', color: '#6b7280', fontSize: 12, cursor: 'pointer', fontFamily: dm }}>
            <RefreshCw size={13} className={refreshing ? 'dash-spin' : ''} />
            Refresh
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 10, background: '#0d1117', border: '1px solid #1e2130' }}>
            <span className="dash-live" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ color: '#6b7280', fontSize: 11, fontFamily: mono }}>{liveTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="dash-up" style={{ animationDelay: '60ms', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {liveStats.map((s, i) => (
          <div key={s.label} className="dash-card" style={{
            background: '#060912', border: `1px solid ${s.color}20`,
            borderRadius: 16, padding: '16px 18px',
            opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(10px)',
            transition: `all 0.4s ease ${i * 50}ms`,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = s.color + '45'; (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 28px ${s.color}12` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = s.color + '20'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
            <div style={{ width: '100%', height: 2, background: `linear-gradient(90deg, transparent, ${s.color}70, transparent)`, borderRadius: 99, marginBottom: 12 }} />
            <p style={{ color: '#4b5563', fontSize: 11, fontFamily: dm, marginBottom: 4 }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: 22, fontWeight: 900, fontFamily: 'Syne, sans-serif', marginBottom: 3, letterSpacing: '-0.02em' }}>{s.value}</p>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: s.up ? '#22c55e' : '#ef4444', fontSize: 11, fontFamily: dm }}>
              {s.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {s.sub}
            </span>
          </div>
        ))}
      </div>

      {/* ── Coin Price Cards ── */}
      <div className="dash-up" style={{ animationDelay: '110ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: 0 }}>Live Prices</h2>
          <span style={{ color: '#374151', fontSize: 11, fontFamily: mono }}>Updated just now</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {liveCoins.map((c, i) => (
            <div key={c.id} className="dash-card" style={{
              background: '#060912', border: `1px solid ${c.color}20`,
              borderRadius: 16, padding: '16px 16px 10px', position: 'relative', overflow: 'hidden',
              opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(10px)',
              transition: `all 0.4s ease ${i * 60}ms`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = c.color + '50'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${c.color}15` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = c.color + '20'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${c.color}90, transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 14, fontFamily: 'Syne, sans-serif' }}>{c.symbol}</span>
                  <p style={{ color: '#374151', fontSize: 10, fontFamily: dm }}>{c.name}</p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  color: c.change24h >= 0 ? '#22c55e' : '#ef4444',
                  background: c.change24h >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', gap: 2, fontFamily: dm,
                }}>
                  {c.change24h >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(c.change24h)}%
                </span>
              </div>
              <p style={{ color: c.color, fontSize: 20, fontWeight: 900, fontFamily: 'Syne, sans-serif', marginBottom: 6, letterSpacing: '-0.02em' }}>
                ${c.price.toLocaleString()}
              </p>
              <MiniChart data={c.history} color={c.color} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ color: '#374151', fontSize: 10, fontFamily: dm }}>MCap ${c.mktCap}</span>
                <span style={{ color: '#374151', fontSize: 10, fontFamily: dm }}>Vol ${c.vol}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Portfolio Chart + Activity ── */}
      <div className="dash-up" style={{ animationDelay: '160ms', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14 }}>

        {/* Portfolio Chart */}
        <div style={{ background: '#060912', border: '1px solid #0f1520', borderRadius: 18, padding: '20px 20px 12px', position: 'relative', overflow: 'hidden' }}>
          <div className="dash-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h3 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: '0 0 3px' }}>Portfolio Value</h3>
                <p style={{ color: '#374151', fontSize: 11, fontFamily: dm, margin: 0 }}>30-day performance</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#22c55e', fontSize: 24, fontWeight: 900, fontFamily: 'Syne, sans-serif', margin: '0 0 2px', letterSpacing: '-0.02em' }}>$14,820</p>
                <span style={{ color: '#22c55e', fontSize: 11, fontFamily: dm, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                  <ArrowUpRight size={11} /> +$2,820 · +23.5%
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={PORTFOLIO_HISTORY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#0f1520" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#374151', fontSize: 10, fontFamily: mono }} axisLine={false} tickLine={false} interval={6} />
                <YAxis tick={{ fill: '#374151', fontSize: 10, fontFamily: mono }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2}
                  fill="url(#portGrad)" dot={false} activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1e3a5f', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ background: '#060912', border: '1px solid #0f1520', borderRadius: 18, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: 0 }}>Activity Feed</h3>
            <Activity size={14} style={{ color: '#374151' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, flex: 1 }}>
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: '#0d1117', border: '1px solid #1a1f2e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={13} style={{ color: '#4b5563' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                      <p style={{ color: '#d1d5db', fontSize: 11, fontWeight: 600, fontFamily: dm, margin: 0 }}>{a.label}</p>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: a.dot, flexShrink: 0, display: 'inline-block' }} />
                    </div>
                    <p style={{ color: '#374151', fontSize: 10, fontFamily: dm, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.detail}</p>
                    <p style={{ color: '#1f2937', fontSize: 10, fontFamily: mono, marginTop: 1 }}>{a.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom: Quick Actions + Progress ── */}
      <div className="dash-up" style={{ animationDelay: '200ms', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Quick Actions */}
        <div style={{ background: '#060912', border: '1px solid #0f1520', borderRadius: 18, padding: '20px' }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: '0 0 14px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Scan NFT',      sub: 'AI risk analysis',    Icon: Shield,        col: '#3b82f6' },
              { label: 'View Charts',   sub: 'Live market data',    Icon: BarChart2,     col: '#8b5cf6' },
              { label: 'Start Lesson',  sub: '6 blockchain modules',Icon: BookOpen,      col: '#10b981' },
              { label: 'Ask AI',        sub: 'Blockchain assistant', Icon: MessageSquare, col: '#f97316' },
            ].map(({ label, sub, Icon, col }) => (
              <button key={label} style={{
                background: '#0d1117', border: `1px solid ${col}20`, borderRadius: 12,
                padding: '14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.22s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = col + '50'; (e.currentTarget as HTMLElement).style.background = col + '0c'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = col + '20'; (e.currentTarget as HTMLElement).style.background = '#0d1117'; (e.currentTarget as HTMLElement).style.transform = 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: col + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Icon size={14} style={{ color: col }} />
                </div>
                <p style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600, fontFamily: dm, margin: '0 0 2px' }}>{label}</p>
                <p style={{ color: '#374151', fontSize: 10, fontFamily: dm, margin: 0 }}>{sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: '#060912', border: '1px solid #0f1520', borderRadius: 18, padding: '20px' }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, fontFamily: 'Syne, sans-serif', margin: '0 0 16px' }}>Your Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Education',    value: 2,  max: 6,  col: '#10b981', detail: '2 of 6 modules done' },
              { label: 'NFT Scans',   value: 14, max: 50, col: '#3b82f6', detail: '14 lifetime scans'    },
              { label: 'AI Sessions', value: 7,  max: 20, col: '#8b5cf6', detail: '7 chats this week'    },
              { label: 'Alerts Set',  value: 3,  max: 10, col: '#f59e0b', detail: '3 active alerts'      },
            ].map(({ label, value, max, col, detail }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12, fontFamily: dm }}>{label}</span>
                  <span style={{ color: col, fontSize: 11, fontFamily: mono }}>{detail}</span>
                </div>
                <div style={{ height: 4, background: '#0d1117', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: `linear-gradient(90deg,${col},${col}88)`, borderRadius: 99, boxShadow: `0 0 8px ${col}44` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 18 }}>
            {[
              { label: 'Streak',      val: '12 days', Icon: Star,    col: '#f59e0b' },
              { label: 'XP Earned',   val: '2,840',   Icon: Zap,     col: '#8b5cf6' },
              { label: 'Time Spent',  val: '14.2h',   Icon: Clock,   col: '#06b6d4' },
            ].map(({ label, val, Icon, col }) => (
              <div key={label} style={{ background: '#0d1117', border: '1px solid #1a1f2e', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                <Icon size={14} style={{ color: col, margin: '0 auto 4px', display: 'block' }} />
                <p style={{ color: '#fff', fontWeight: 900, fontSize: 13, fontFamily: 'Syne, sans-serif', margin: '0 0 2px' }}>{val}</p>
                <p style={{ color: '#374151', fontSize: 9, fontFamily: dm, margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}