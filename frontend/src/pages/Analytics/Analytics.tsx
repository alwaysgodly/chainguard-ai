import { useState, useEffect } from 'react'
import {
  BarChart2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  RefreshCw, Filter, Search, Star, Volume2
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid, LineChart, Line, Cell
} from 'recharts'
import api from '@/services/api'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  .anl * { box-sizing: border-box; }
  @keyframes anl-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes anl-shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes anl-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes anl-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .anl-up    { animation: anl-up 0.5s cubic-bezier(.4,0,.2,1) both; }
  .anl-live  { animation: anl-pulse 2s ease infinite; }
  .anl-spin  { animation: anl-spin 1.4s linear infinite; }
  .anl-shimmer {
    background: linear-gradient(90deg,#3b82f6 0%,#8b5cf6 30%,#06b6d4 60%,#3b82f6 100%);
    background-size: 600px 100%;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    animation: anl-shimmer 4s linear infinite;
  }
  .anl-row { transition: background 0.18s ease; }
  .anl-row:hover { background: rgba(59,130,246,0.04) !important; }
  .anl-tab { transition: all 0.2s ease; cursor: pointer; }
  .anl-card { transition: transform 0.26s cubic-bezier(.34,1.56,.64,1), box-shadow 0.26s ease, border-color 0.26s ease; }
  .anl-card:hover { transform: translateY(-3px); }
  .anl-grid {
    background-image: linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),
                      linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px);
    background-size: 36px 36px;
  }
`

const COIN_COLORS: Record<string,string> = {
  bitcoin:'#f97316', ethereum:'#8b5cf6', tether:'#22c55e', binancecoin:'#eab308',
  solana:'#06b6d4', ripple:'#06b6d4', cardano:'#8b5cf6', dogecoin:'#eab308',
  'avalanche-2':'#ef4444', polkadot:'#ef4444',
}

const TIMEFRAMES = ['1D','1W','1M','3M','1Y']

const DOMINANCE = [
  { name: 'BTC', val: 52.4, color: '#f97316' },
  { name: 'ETH', val: 17.4, color: '#8b5cf6' },
  { name: 'SOL', val:  3.4, color: '#06b6d4' },
  { name: 'BNB', val:  2.6, color: '#eab308' },
  { name: 'Other',val:24.2, color: '#374151' },
]

// ─── Components ───────────────────────────────────────────────────────────────
const Tip = ({ active, payload, prefix = '$' }: any) => {
  if (!active || !payload?.length) return null
  const v = Number(payload[0].value)
  return (
    <div style={{ background:'#0a0d14', border:'1px solid #1e2130', borderRadius:8, padding:'5px 10px' }}>
      <span style={{ color:'#e2e8f0', fontSize:12, fontFamily:'JetBrains Mono, monospace' }}>
        {prefix}{v > 100 ? v.toLocaleString(undefined,{maximumFractionDigits:0}) : v.toFixed(2)}
      </span>
    </div>
  )
}

const FGTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const v = Number(payload[0].value)
  const label = v < 25 ? 'Extreme Fear' : v < 45 ? 'Fear' : v < 55 ? 'Neutral' : v < 75 ? 'Greed' : 'Extreme Greed'
  const col = v < 25 ? '#ef4444' : v < 45 ? '#f97316' : v < 55 ? '#eab308' : v < 75 ? '#22c55e' : '#10b981'
  return (
    <div style={{ background:'#0a0d14', border:'1px solid #1e2130', borderRadius:8, padding:'5px 10px' }}>
      <span style={{ color: col, fontSize:12, fontFamily:'JetBrains Mono, monospace' }}>{v.toFixed(0)} · {label}</span>
    </div>
  )
}

export default function Analytics() {
  const [coins, setCoins]                 = useState<any[]>([])
  const [selectedCoin, setSelectedCoin]   = useState<any>(null)
  const [chartData, setChartData]         = useState<any[]>([])
  const [fearGreed, setFearGreed]         = useState(50)
  const [fgHistory, setFgHistory]         = useState<any[]>([])
  const [totalVolume, setTotalVolume]     = useState('$94.3B')
  const [timeframe, setTimeframe]         = useState('1M')
  const [search, setSearch]               = useState('')
  const [refreshing, setRefreshing]       = useState(false)
  const [mounted, setMounted]             = useState(false)

  const fetchData = async () => {
    try {
      const [coinsRes, fgRes] = await Promise.all([
        api.get('/analytics/coins?per_page=10&sparkline=true'),
        api.get('/analytics/fear-greed').catch(() => ({ data: { data: [] } })),
      ])

      const coinData = (coinsRes.data.data || []).map((c: any, i: number) => ({
        rank: c.market_cap_rank || i + 1,
        sym: c.symbol?.toUpperCase(),
        name: c.name,
        price: c.current_price,
        chg24h: Number((c.price_change_percentage_24h || 0).toFixed(2)),
        chg7d: Number((c.price_change_percentage_7d_in_currency || 0).toFixed(2)),
        mktCap: c.market_cap >= 1e12 ? `$${(c.market_cap/1e12).toFixed(2)}T` : `$${(c.market_cap/1e9).toFixed(0)}B`,
        vol: c.total_volume >= 1e9 ? `$${(c.total_volume/1e9).toFixed(1)}B` : `$${(c.total_volume/1e6).toFixed(0)}M`,
        color: COIN_COLORS[c.id] || '#3b82f6',
        up: (c.price_change_percentage_24h || 0) >= 0,
        id: c.id,
        history: (c.sparkline_in_7d?.price || []).map((v: number, j: number) => ({ d: j, v })),
      }))
      setCoins(coinData)
      if (coinData.length > 0 && !selectedCoin) setSelectedCoin(coinData[0])

      // Fear & Greed
      const fgData = fgRes.data.data || []
      if (fgData.length > 0) {
        setFearGreed(Number(fgData[0].value) || 50)
        setFgHistory(fgData.slice(0, 30).map((d: any, i: number) => ({ d: `D${i+1}`, v: Number(d.value) })))
      }
    } catch (e) { console.error('Analytics fetch error:', e) }
  }

  useEffect(() => { setMounted(true); fetchData() }, [])

  // Fetch chart when selected coin or timeframe changes
  useEffect(() => {
    if (!selectedCoin?.id) return
    const days = timeframe === '1D' ? 1 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365
    api.get(`/analytics/coins/${selectedCoin.id}/chart?days=${days}`)
      .then(res => {
        const prices = res.data.data?.prices || []
        setChartData(prices.map((p: number[], i: number) => ({ d: i, v: p[1] })))
      })
      .catch(() => setChartData(selectedCoin.history || []))
  }, [selectedCoin?.id, timeframe])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData().finally(() => setTimeout(() => setRefreshing(false), 600))
  }

  const filtered = coins.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sym.toLowerCase().includes(search.toLowerCase())
  )

  const fgColor = fearGreed < 25 ? '#ef4444' : fearGreed < 45 ? '#f97316' : fearGreed < 55 ? '#eab308' : fearGreed < 75 ? '#22c55e' : '#10b981'
  const fgLabel = fearGreed < 25 ? 'Extreme Fear' : fearGreed < 45 ? 'Fear' : fearGreed < 55 ? 'Neutral' : fearGreed < 75 ? 'Greed' : 'Extreme Greed'

  const dm   = 'DM Sans, sans-serif'
  const mono = 'JetBrains Mono, monospace'
  const syne = 'Syne, sans-serif'

  const sc = selectedCoin || { sym:'BTC', name:'Bitcoin', price:0, chg24h:0, mktCap:'$0', vol:'$0', color:'#f97316', history:[] }
  const displayChart = chartData.length > 0 ? chartData : sc.history || []

  // Volume history from coins
  const VOL_HISTORY = coins.slice(0, 14).map((c, i) => ({ d: `${i+1}`, v: c.price ? (c.price / (coins[0]?.price || 1)) * 80 : 50 }))
  const totalVol = coins.reduce((s, c) => s + Number(String(c.vol).replace(/[$,BMT]/g,'') || 0), 0)

  return (
    <div className="anl" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div className="anl-up" style={{ animationDelay:'0ms', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BarChart2 size={22} style={{ color:'#8b5cf6' }} />
          </div>
          <div>
            <h1 style={{ fontFamily:syne, fontSize:22, fontWeight:900, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>
              Market Analytics
            </h1>
            <p style={{ color:'#4b5563', fontSize:12, fontFamily:dm, margin:0 }}>Live crypto data · Realtime charts</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={handleRefresh}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, background:'#0d1117', border:'1px solid #1e2130', color:'#6b7280', fontSize:12, cursor:'pointer', fontFamily:dm }}>
            <RefreshCw size={13} className={refreshing?'anl-spin':''} /> Refresh
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:10, background:'#0d1117', border:'1px solid #1e2130' }}>
            <span className="anl-live" style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
            <span style={{ color:'#6b7280', fontSize:11, fontFamily:mono }}>Live</span>
          </div>
        </div>
      </div>

      {/* ── Top Row: Big Chart + Sidebar Stats ── */}
      <div className="anl-up" style={{ animationDelay:'60ms', display:'grid', gridTemplateColumns:'1fr 280px', gap:14 }}>

        {/* Main Price Chart */}
        <div style={{ background:'#060912', border:'1px solid #0f1520', borderRadius:18, padding:'20px 20px 14px', position:'relative', overflow:'hidden' }}>
          <div className="anl-grid" style={{ position:'absolute', inset:0, opacity:0.6 }} />
          <div style={{ position:'relative' }}>
            {/* Coin selector */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14, flexWrap:'wrap', gap:10 }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {coins.slice(0,4).map(c => (
                  <button key={c.sym} onClick={() => setSelectedCoin(c)}
                    style={{ padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:mono,
                      background: sc.sym === c.sym ? c.color + '20' : '#0d1117',
                      border: `1px solid ${sc.sym === c.sym ? c.color + '60' : '#1a1f2e'}`,
                      color: sc.sym === c.sym ? c.color : '#4b5563',
                      transition:'all 0.2s' }}>
                    {c.sym}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', gap:4 }}>
                {TIMEFRAMES.map(tf => (
                  <button key={tf} onClick={() => setTimeframe(tf)}
                    style={{ padding:'4px 10px', borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:mono,
                      background: timeframe===tf ? sc.color+'20' : 'transparent',
                      border: `1px solid ${timeframe===tf ? sc.color+'50' : 'transparent'}`,
                      color: timeframe===tf ? sc.color : '#374151',
                      transition:'all 0.18s' }}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Price headline */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:4 }}>
                <span style={{ color:sc.color, fontSize:32, fontWeight:900, fontFamily:syne, letterSpacing:'-0.03em' }}>
                  ${sc.price?.toLocaleString() || '0'}
                </span>
                <span style={{ fontSize:14, fontWeight:600, color:sc.chg24h>=0?'#22c55e':'#ef4444', display:'flex', alignItems:'center', gap:3, fontFamily:dm }}>
                  {sc.chg24h>=0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                  {Math.abs(sc.chg24h)}% today
                </span>
              </div>
              <p style={{ color:'#374151', fontSize:11, fontFamily:dm, margin:0 }}>{sc.name} · Market Cap {sc.mktCap} · Vol {sc.vol}</p>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={displayChart} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={sc.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={sc.color} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#0f1520" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" tick={{ fill:'#374151', fontSize:10, fontFamily:mono }} axisLine={false} tickLine={false} interval={Math.floor(displayChart.length / 6)} />
                <YAxis tick={{ fill:'#374151', fontSize:10, fontFamily:mono }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v.toFixed(2)}`} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="v" stroke={sc.color} strokeWidth={2}
                  fill="url(#coinGrad)" dot={false}
                  activeDot={{ r:4, fill:sc.color, stroke:'#0a0d14', strokeWidth:2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar: Fear/Greed + Dominance */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Fear & Greed */}
          <div style={{ background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
              <h3 style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, fontFamily:syne, margin:0 }}>Fear & Greed</h3>
              <span style={{ color:'#374151', fontSize:10, fontFamily:mono }}>Today</span>
            </div>
            <div style={{ textAlign:'center', marginBottom:14 }}>
              <div style={{ fontSize:48, fontWeight:900, fontFamily:syne, color:fgColor, lineHeight:1, letterSpacing:'-0.04em' }}>{fearGreed}</div>
              <p style={{ color:fgColor, fontSize:13, fontWeight:600, fontFamily:dm, margin:'4px 0 0' }}>{fgLabel}</p>
            </div>
            <div style={{ height:6, background:'linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#10b981)', borderRadius:99, position:'relative', marginBottom:8 }}>
              <div style={{ position:'absolute', top:'50%', transform:'translate(-50%,-50%)', width:10, height:10, borderRadius:'50%', background:'#fff', border:'2px solid #0a0d14', left:`${fearGreed}%`, transition:'left 0.5s ease' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'#ef4444', fontSize:9, fontFamily:mono }}>Fear</span>
              <span style={{ color:'#10b981', fontSize:9, fontFamily:mono }}>Greed</span>
            </div>
            {fgHistory.length > 0 && (
              <div style={{ marginTop:12 }}>
                <ResponsiveContainer width="100%" height={55}>
                  <AreaChart data={fgHistory} margin={{top:2,right:0,left:0,bottom:0}}>
                    <defs>
                      <linearGradient id="fgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={fgColor} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={fgColor} stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={fgColor} strokeWidth={1.5} fill="url(#fgGrad)" dot={false} />
                    <Tooltip content={<FGTip />} />
                  </AreaChart>
                </ResponsiveContainer>
                <p style={{ color:'#374151', fontSize:10, fontFamily:dm, margin:'4px 0 0', textAlign:'center' }}>30-day trend</p>
              </div>
            )}
          </div>

          {/* Dominance */}
          <div style={{ background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'18px', flex:1 }}>
            <h3 style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, fontFamily:syne, margin:'0 0 14px' }}>Market Dominance</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {DOMINANCE.map(d => (
                <div key={d.name}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ color:'#9ca3af', fontSize:11, fontFamily:mono }}>{d.name}</span>
                    <span style={{ color:d.color, fontSize:11, fontFamily:mono, fontWeight:600 }}>{d.val}%</span>
                  </div>
                  <div style={{ height:4, background:'#0d1117', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${d.val}%`, background:d.color, borderRadius:99, boxShadow:`0 0 6px ${d.color}55` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Volume + Coin Table ── */}
      <div className="anl-up" style={{ animationDelay:'120ms', display:'grid', gridTemplateColumns:'300px 1fr', gap:14 }}>

        {/* Volume Chart */}
        <div style={{ background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'18px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
            <Volume2 size={14} style={{ color:'#3b82f6' }} />
            <h3 style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, fontFamily:syne, margin:0 }}>24h Volume</h3>
          </div>
          <p style={{ color:'#3b82f6', fontSize:22, fontWeight:900, fontFamily:syne, margin:'0 0 14px', letterSpacing:'-0.02em' }}>{totalVolume}</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={VOL_HISTORY} margin={{top:0,right:0,left:-20,bottom:0}}>
              <XAxis dataKey="d" tick={{ fill:'#374151', fontSize:9, fontFamily:mono }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill:'#374151', fontSize:9, fontFamily:mono }} axisLine={false} tickLine={false} tickFormatter={v=>`${v.toFixed(0)}B`} />
              <Tooltip content={<Tip prefix="" />} />
              <Bar dataKey="v" radius={[3,3,0,0]}>
                {VOL_HISTORY.map((_, i) => (
                  <Cell key={i} fill={i === VOL_HISTORY.length-1 ? '#3b82f6' : '#1e2130'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Coin Table */}
        <div style={{ background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'18px', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:10 }}>
            <h3 style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, fontFamily:syne, margin:0 }}>All Markets</h3>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'#0d1117', border:'1px solid #1a1f2e', borderRadius:8, padding:'5px 10px' }}>
              <Search size={12} style={{ color:'#374151' }} />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search coin..."
                style={{ background:'transparent', border:'none', outline:'none', color:'#9ca3af', fontSize:12, width:120, fontFamily:dm }} />
            </div>
          </div>

          {/* Table Header */}
          <div style={{ display:'grid', gridTemplateColumns:'32px 1fr 100px 80px 80px 100px 100px', gap:8, padding:'6px 10px', marginBottom:4 }}>
            {['#','Coin','Price','24h','7d','Market Cap','Volume'].map(h => (
              <span key={h} style={{ color:'#374151', fontSize:10, fontFamily:mono, textAlign: h==='#'?'center':'left' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {filtered.map((c, i) => (
              <div key={c.sym} className="anl-row" onClick={() => setSelectedCoin(c)}
                style={{ display:'grid', gridTemplateColumns:'32px 1fr 100px 80px 80px 100px 100px', gap:8,
                  padding:'9px 10px', borderRadius:10, cursor:'pointer',
                  background: sc.sym===c.sym ? c.color+'0a' : 'transparent',
                  border: `1px solid ${sc.sym===c.sym ? c.color+'25' : 'transparent'}`,
                  opacity: mounted ? 1 : 0, transition: `opacity 0.3s ease ${i*40}ms`,
                }}>
                <span style={{ color:'#374151', fontSize:11, fontFamily:mono, textAlign:'center', alignSelf:'center' }}>{c.rank}</span>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:c.color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ color:c.color, fontSize:10, fontWeight:700, fontFamily:mono }}>{c.sym.slice(0,3)}</span>
                  </div>
                  <div>
                    <p style={{ color:'#e2e8f0', fontSize:12, fontWeight:600, fontFamily:dm, margin:0 }}>{c.name}</p>
                    <p style={{ color:'#374151', fontSize:10, fontFamily:mono, margin:0 }}>{c.sym}</p>
                  </div>
                </div>
                <span style={{ color:'#e2e8f0', fontSize:12, fontFamily:mono, fontWeight:600, alignSelf:'center' }}>
                  ${c.price >= 1 ? c.price.toLocaleString() : c.price?.toFixed(4)}
                </span>
                <span style={{ color:c.chg24h>=0?'#22c55e':'#ef4444', fontSize:11, fontFamily:mono, alignSelf:'center', display:'flex', alignItems:'center', gap:2 }}>
                  {c.chg24h>=0?<ArrowUpRight size={10}/>:<ArrowDownRight size={10}/>}
                  {Math.abs(c.chg24h)}%
                </span>
                <span style={{ color:c.chg7d>=0?'#22c55e':'#ef4444', fontSize:11, fontFamily:mono, alignSelf:'center' }}>
                  {c.chg7d>=0?'+':''}{c.chg7d}%
                </span>
                <span style={{ color:'#6b7280', fontSize:11, fontFamily:mono, alignSelf:'center' }}>{c.mktCap}</span>
                <span style={{ color:'#6b7280', fontSize:11, fontFamily:mono, alignSelf:'center' }}>{c.vol}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}