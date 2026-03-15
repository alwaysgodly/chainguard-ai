import { useState } from 'react'
import {
  Shield, Search, AlertTriangle, CheckCircle, XCircle,
  Clock, Zap, ExternalLink, ChevronDown, ChevronUp, Info
} from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  .nft * { box-sizing: border-box; }
  @keyframes nft-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes nft-fade { from{opacity:0} to{opacity:1} }
  @keyframes nft-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes nft-scan { 0%{top:0%;opacity:.8} 100%{top:100%;opacity:0} }
  @keyframes nft-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 12px rgba(239,68,68,0)} }
  @keyframes nft-glow-g { 0%,100%{box-shadow:0 0 16px rgba(34,197,94,0.3)} 50%{box-shadow:0 0 32px rgba(34,197,94,0.6)} }
  .nft-up   { animation: nft-up 0.5s cubic-bezier(.4,0,.2,1) both; }
  .nft-fade { animation: nft-fade 0.4s ease both; }
  .nft-spin { animation: nft-spin 1s linear infinite; }
  .nft-scanner-beam { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#3b82f6,transparent); animation:nft-scan 1.5s ease-in-out infinite; }
  .nft-danger  { animation: nft-pulse 2s ease infinite; }
  .nft-success { animation: nft-glow-g 2.5s ease infinite; }
  .nft-card { transition: transform 0.26s cubic-bezier(.34,1.56,.64,1), box-shadow 0.26s ease, border-color 0.26s ease; }
  .nft-card:hover { transform: translateY(-2px); }
  .nft-factor { transition: all 0.2s ease; cursor: pointer; }
  .nft-factor:hover { background: rgba(59,130,246,0.04) !important; }
`

// ─── Mock scan result generator ───────────────────────────────────────────────
const MOCK_RESULTS: Record<string, any> = {
  '0x1234': {
    name: 'CryptoPunk #3812', collection: 'CryptoPunks', tokenId: '3812',
    riskScore: 12, riskBand: 'LOW',
    image: null,
    contract: '0x1234...5678',
    chain: 'Ethereum',
    factors: [
      { name: 'Contract Safety',     score: 95, detail: 'No reentrancy or honeypot patterns detected in bytecode',   severity: 'safe'   },
      { name: 'Metadata Integrity',  score: 91, detail: 'All images resolve correctly; IPFS pinned to Pinata',        severity: 'safe'   },
      { name: 'Trading Activity',    score: 82, detail: 'Organic trading pattern; no wash trading signals detected',  severity: 'safe'   },
      { name: 'Creator Reputation',  score: 96, detail: 'LarvaLabs — verified creator, 3+ years history',            severity: 'safe'   },
      { name: 'Royalty Structure',   score: 88, detail: 'Standard 5% royalty, no unusual transfer restrictions',      severity: 'safe'   },
      { name: 'Liquidity Risk',      score: 65, detail: 'Moderate liquidity; floor price has held 6+ months',        severity: 'medium' },
    ],
    radarData: [
      { axis: 'Contract', val: 95 }, { axis: 'Metadata', val: 91 }, { axis: 'Trading', val: 82 },
      { axis: 'Creator', val: 96 }, { axis: 'Royalty', val: 88 }, { axis: 'Liquidity', val: 65 },
    ],
    scannedAt: '2 minutes ago',
    floorPrice: '68.5 ETH',
    owners: '3,842',
    totalSupply: '10,000',
  },
  '0xbayc': {
    name: 'BAYC #7291', collection: 'Bored Ape Yacht Club', tokenId: '7291',
    riskScore: 78, riskBand: 'HIGH',
    image: null,
    contract: '0xBC4C...A08B',
    chain: 'Ethereum',
    factors: [
      { name: 'Contract Safety',     score: 71, detail: 'Suspicious callback pattern detected in transfer function',  severity: 'medium' },
      { name: 'Metadata Integrity',  score: 45, detail: 'IPFS gateway returning 404 for 3 attributes',               severity: 'high'   },
      { name: 'Trading Activity',    score: 28, detail: 'Unusual volume spike: 12 self-trades in 24h window',        severity: 'high'   },
      { name: 'Creator Reputation',  score: 88, detail: 'Yuga Labs — verified, though SEC concerns noted',           severity: 'safe'   },
      { name: 'Royalty Structure',   score: 55, detail: 'Non-standard royalty enforcement mechanism',                severity: 'medium' },
      { name: 'Liquidity Risk',      score: 42, detail: 'Floor price dropped 65% in last 30 days',                  severity: 'high'   },
    ],
    radarData: [
      { axis: 'Contract', val: 71 }, { axis: 'Metadata', val: 45 }, { axis: 'Trading', val: 28 },
      { axis: 'Creator', val: 88 }, { axis: 'Royalty', val: 55 }, { axis: 'Liquidity', val: 42 },
    ],
    scannedAt: '3 hours ago',
    floorPrice: '12.3 ETH',
    owners: '6,421',
    totalSupply: '10,000',
  },
}

const RECENT_SCANS = [
  { name: 'CryptoPunk #3812', score: 12,  band: 'LOW',    time: '2m ago'  },
  { name: 'BAYC #7291',       score: 78,  band: 'HIGH',   time: '3h ago'  },
  { name: 'Azuki #4441',      score: 34,  band: 'LOW',    time: '1d ago'  },
  { name: 'Doodle #2201',     score: 55,  band: 'MEDIUM', time: '2d ago'  },
  { name: 'CloneX #9922',     score: 21,  band: 'LOW',    time: '3d ago'  },
]

// ─── Risk Score Ring ──────────────────────────────────────────────────────────
function RiskRing({ score }: { score: number }) {
  const col = score < 30 ? '#22c55e' : score < 60 ? '#f59e0b' : score < 80 ? '#f97316' : '#ef4444'
  const circumference = 2 * Math.PI * 42
  const offset = circumference * (1 - score / 100)
  const label = score < 30 ? 'LOW RISK' : score < 60 ? 'MEDIUM RISK' : score < 80 ? 'HIGH RISK' : 'CRITICAL'
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <div style={{ position:'relative', width:110, height:110 }}>
        <svg width="110" height="110" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="42" fill="none" stroke="#0d1117" strokeWidth="8" />
          <circle cx="48" cy="48" r="42" fill="none" stroke={col} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transformOrigin:'center', transform:'rotate(-90deg)', filter:`drop-shadow(0 0 6px ${col}88)`, transition:'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:'#fff', fontSize:26, fontWeight:900, fontFamily:'Syne,sans-serif', lineHeight:1 }}>{score}</span>
          <span style={{ color:'#374151', fontSize:9, fontFamily:'JetBrains Mono,monospace' }}>/100</span>
        </div>
      </div>
      <span style={{ color:col, fontSize:11, fontWeight:700, fontFamily:'JetBrains Mono,monospace',
        background:col+'18', border:`1px solid ${col}35`, padding:'3px 10px', borderRadius:99, letterSpacing:'0.08em' }}>
        {label}
      </span>
    </div>
  )
}

export default function NFTScanner() {
  const [query, setQuery]           = useState('')
  const [scanning, setScanning]     = useState(false)
  const [result, setResult]         = useState<any>(null)
  const [expandedFactor, setExpandedFactor] = useState<number | null>(null)
  const [scanProgress, setScanProgress]     = useState(0)

  const dm   = 'DM Sans, sans-serif'
  const mono = 'JetBrains Mono, monospace'
  const syne = 'Syne, sans-serif'

  const handleScan = () => {
    if (!query.trim()) return
    setScanning(true)
    setResult(null)
    setScanProgress(0)

    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 95) { clearInterval(interval); return 95 }
        return p + Math.random() * 18
      })
    }, 180)

    setTimeout(() => {
      clearInterval(interval)
      setScanProgress(100)
      const key = query.toLowerCase().includes('bayc') || query.includes('7291') ? '0xbayc' : '0x1234'
      setTimeout(() => {
        setResult(MOCK_RESULTS[key])
        setScanning(false)
      }, 300)
    }, 2200)
  }

  const sevColor = (s: string) => s === 'safe' ? '#22c55e' : s === 'medium' ? '#f59e0b' : '#ef4444'
  const bandColor = (b: string) => b === 'LOW' ? '#22c55e' : b === 'MEDIUM' ? '#f59e0b' : '#ef4444'

  const RadarTip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background:'#0a0d14', border:'1px solid #1e2130', borderRadius:8, padding:'5px 10px' }}>
        <span style={{ color:'#e2e8f0', fontSize:12, fontFamily:mono }}>{payload[0].payload.axis}: {payload[0].value}</span>
      </div>
    )
  }

  return (
    <div className="nft" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div className="nft-up" style={{ animationDelay:'0ms', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Shield size={22} style={{ color:'#ef4444' }} />
          </div>
          <div>
            <h1 style={{ fontFamily:syne, fontSize:22, fontWeight:900, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>NFT Risk Scanner</h1>
            <p style={{ color:'#4b5563', fontSize:12, fontFamily:dm, margin:0 }}>AI-powered NFT risk detection · 6 factor analysis</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {['Contract','Metadata','Trading','Creator','Royalty','Liquidity'].map(f => (
            <span key={f} style={{ fontSize:10, color:'#374151', fontFamily:mono, background:'#0d1117', border:'1px solid #1a1f2e', borderRadius:6, padding:'3px 7px' }}>{f}</span>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16, alignItems:'start' }}>

        {/* Left: Search + Results */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Search Bar */}
          <div className="nft-up" style={{ animationDelay:'60ms', background:'#060912', border:'1px solid #1a1f2e', borderRadius:18, padding:'20px' }}>
            <h3 style={{ color:'#e2e8f0', fontSize:14, fontWeight:700, fontFamily:syne, margin:'0 0 12px' }}>Scan NFT for Risks</h3>
            <p style={{ color:'#4b5563', fontSize:12, fontFamily:dm, margin:'0 0 16px' }}>
              Enter a contract address, NFT name, or collection — our AI analyzes 6 risk dimensions in real time.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ flex:1, display:'flex', alignItems:'center', gap:10, background:'#0d1117', border:'1px solid #1a1f2e', borderRadius:12, padding:'10px 14px' }}>
                <Search size={15} style={{ color:'#374151', flexShrink:0 }} />
                <input value={query} onChange={e=>setQuery(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleScan()}
                  placeholder="0x1234... or 'BAYC #7291' or 'CryptoPunks'"
                  style={{ background:'transparent', border:'none', outline:'none', color:'#e2e8f0', fontSize:13, width:'100%', fontFamily:dm }} />
              </div>
              <button onClick={handleScan} disabled={scanning||!query.trim()}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, fontWeight:700, fontSize:13, cursor:scanning?'not-allowed':'pointer', fontFamily:syne,
                  background:scanning||!query.trim() ? '#0d1117' : 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                  color:scanning||!query.trim() ? '#374151' : '#fff',
                  border:`1px solid ${scanning||!query.trim() ? '#1a1f2e' : 'transparent'}`,
                  transition:'all 0.2s ease',
                  opacity:!query.trim() ? 0.5 : 1,
                }}>
                <Zap size={15} className={scanning?'nft-spin':''} />
                {scanning ? 'Scanning...' : 'Scan Now'}
              </button>
            </div>

            {/* Progress Bar */}
            {scanning && (
              <div className="nft-fade" style={{ marginTop:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ color:'#6b7280', fontSize:11, fontFamily:dm }}>Analyzing NFT risk factors...</span>
                  <span style={{ color:'#3b82f6', fontSize:11, fontFamily:mono }}>{Math.round(scanProgress)}%</span>
                </div>
                <div style={{ height:4, background:'#0d1117', borderRadius:99, overflow:'hidden', position:'relative' }}>
                  <div style={{ height:'100%', width:`${scanProgress}%`, background:'linear-gradient(90deg,#3b82f6,#8b5cf6)', borderRadius:99, transition:'width 0.2s ease', boxShadow:'0 0 8px #3b82f655' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                  {['Contract','Metadata','Trading','Creator','Royalty','Liquidity'].map((f,i) => (
                    <span key={f} style={{ fontSize:9, fontFamily:mono, color: scanProgress > (i+1)*15 ? '#3b82f6' : '#1f2937' }}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Try these */}
            {!scanning && !result && (
              <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ color:'#374151', fontSize:11, fontFamily:dm }}>Try:</span>
                {['CryptoPunk #3812','BAYC #7291','Azuki #4441'].map(s => (
                  <button key={s} onClick={() => { setQuery(s); }}
                    style={{ fontSize:11, color:'#4b5563', background:'#0d1117', border:'1px solid #1a1f2e', borderRadius:6, padding:'3px 10px', cursor:'pointer', fontFamily:mono,
                      transition:'all 0.18s ease' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#3b82f6';(e.currentTarget as HTMLElement).style.borderColor='#3b82f655'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='#4b5563';(e.currentTarget as HTMLElement).style.borderColor='#1a1f2e'}}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scan Result */}
          {result && (
            <div className="nft-fade" style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Result Header */}
              <div style={{ background:'#060912', border:`1px solid ${bandColor(result.riskBand)}25`, borderRadius:18, padding:'20px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${bandColor(result.riskBand)}80,transparent)` }} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:20, alignItems:'center' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <CheckCircle size={14} style={{ color:bandColor(result.riskBand) }} />
                      <span style={{ color:'#374151', fontSize:11, fontFamily:mono }}>Scan complete · {result.scannedAt}</span>
                    </div>
                    <h2 style={{ color:'#fff', fontSize:20, fontWeight:900, fontFamily:syne, margin:'0 0 3px', letterSpacing:'-0.02em' }}>{result.name}</h2>
                    <p style={{ color:'#4b5563', fontSize:12, fontFamily:dm, margin:'0 0 12px' }}>{result.collection} · {result.chain} · Token #{result.tokenId}</p>
                    <div style={{ display:'flex', gap:12 }}>
                      {[
                        ['Floor Price', result.floorPrice],
                        ['Total Supply', result.totalSupply],
                        ['Unique Owners', result.owners],
                        ['Contract', result.contract],
                      ].map(([k,v]) => (
                        <div key={k as string}>
                          <p style={{ color:'#374151', fontSize:10, fontFamily:dm, margin:'0 0 1px' }}>{k}</p>
                          <p style={{ color:'#9ca3af', fontSize:12, fontWeight:600, fontFamily:mono, margin:0 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <RiskRing score={result.riskScore} />
                  </div>
                  <div style={{ width:160, height:160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={result.radarData} margin={{top:10,right:10,bottom:10,left:10}}>
                        <PolarGrid stroke="#1a1f2e" />
                        <PolarAngleAxis dataKey="axis" tick={{ fill:'#374151', fontSize:9, fontFamily:mono }} />
                        <Radar dataKey="val" stroke={bandColor(result.riskBand)} fill={bandColor(result.riskBand)} fillOpacity={0.15} strokeWidth={1.5} />
                        <Tooltip content={<RadarTip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div style={{ background:'#060912', border:'1px solid #0f1520', borderRadius:18, padding:'20px' }}>
                <h3 style={{ color:'#e2e8f0', fontSize:14, fontWeight:700, fontFamily:syne, margin:'0 0 14px' }}>Risk Factor Breakdown</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {result.factors.map((f: any, i: number) => {
                    const col = sevColor(f.severity)
                    const open = expandedFactor === i
                    return (
                      <div key={i} className="nft-factor" onClick={() => setExpandedFactor(open ? null : i)}
                        style={{ background:'#0d1117', border:`1px solid ${open ? col+'30' : '#1a1f2e'}`, borderRadius:12, overflow:'hidden', transition:'border-color 0.2s' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px' }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:col+'12', border:`1px solid ${col}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {f.severity==='safe' ? <CheckCircle size={15} style={{color:col}} /> : f.severity==='medium' ? <AlertTriangle size={15} style={{color:col}} /> : <XCircle size={15} style={{color:col}} />}
                          </div>
                          <div style={{ flex:1 }}>
                            <p style={{ color:'#e2e8f0', fontSize:12, fontWeight:600, fontFamily:dm, margin:'0 0 2px' }}>{f.name}</p>
                            <div style={{ height:3, background:'#0a0d14', borderRadius:99, width:'100%', overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${f.score}%`, background:col, borderRadius:99, boxShadow:`0 0 6px ${col}55` }} />
                            </div>
                          </div>
                          <span style={{ color:col, fontSize:13, fontWeight:700, fontFamily:mono, minWidth:28, textAlign:'right' }}>{f.score}</span>
                          {open ? <ChevronUp size={13} style={{color:'#374151'}} /> : <ChevronDown size={13} style={{color:'#374151'}} />}
                        </div>
                        {open && (
                          <div style={{ padding:'0 14px 12px 62px', borderTop:'1px solid #111520' }}>
                            <div style={{ display:'flex', alignItems:'flex-start', gap:6, paddingTop:10 }}>
                              <Info size={12} style={{ color:'#374151', flexShrink:0, marginTop:1 }} />
                              <p style={{ color:'#6b7280', fontSize:11, fontFamily:dm, margin:0, lineHeight:1.7 }}>{f.detail}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!scanning && !result && (
            <div className="nft-up" style={{ animationDelay:'80ms', background:'#060912', border:'1px solid #0f1520', borderRadius:18, padding:'48px 24px', textAlign:'center' }}>
              <div style={{ width:56, height:56, borderRadius:16, background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <Shield size={24} style={{ color:'#3b82f6' }} />
              </div>
              <h3 style={{ color:'#e2e8f0', fontSize:16, fontWeight:700, fontFamily:syne, margin:'0 0 8px' }}>No Scan Results Yet</h3>
              <p style={{ color:'#374151', fontSize:13, fontFamily:dm, margin:0, maxWidth:360, marginLeft:'auto', marginRight:'auto' }}>
                Enter an NFT contract address or name above to begin. Our ML model analyses 6 risk vectors in under 3 seconds.
              </p>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Recent Scans */}
          <div className="nft-up" style={{ animationDelay:'80ms', background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, fontFamily:syne, margin:0 }}>Recent Scans</h3>
              <Clock size={13} style={{ color:'#374151' }} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {RECENT_SCANS.map((s, i) => {
                const col = bandColor(s.band)
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'#0d1117', border:'1px solid #1a1f2e', cursor:'pointer', transition:'all 0.18s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=col+'30'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1a1f2e'}}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:col, flexShrink:0, boxShadow:`0 0 6px ${col}88` }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:'#d1d5db', fontSize:11, fontWeight:600, fontFamily:dm, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</p>
                      <p style={{ color:'#374151', fontSize:10, fontFamily:mono, margin:0 }}>{s.time}</p>
                    </div>
                    <span style={{ color:col, fontSize:12, fontWeight:700, fontFamily:mono }}>{s.score}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Risk Guide */}
          <div className="nft-up" style={{ animationDelay:'110ms', background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'18px' }}>
            <h3 style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, fontFamily:syne, margin:'0 0 14px' }}>Risk Score Guide</h3>
            {[
              { range:'0–29',  label:'Low Risk',      col:'#22c55e', desc:'Generally safe to transact' },
              { range:'30–59', label:'Medium Risk',   col:'#f59e0b', desc:'Exercise caution, research more' },
              { range:'60–79', label:'High Risk',     col:'#f97316', desc:'Significant red flags present' },
              { range:'80–100',label:'Critical Risk', col:'#ef4444', desc:'Strong indicators of scam/rug' },
            ].map(({ range, label, col, desc }) => (
              <div key={range} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:12 }}>
                <span style={{ color:col, fontSize:11, fontFamily:mono, background:col+'12', border:`1px solid ${col}25`, padding:'2px 8px', borderRadius:6, whiteSpace:'nowrap', flexShrink:0 }}>{range}</span>
                <div>
                  <p style={{ color:'#d1d5db', fontSize:11, fontWeight:600, fontFamily:dm, margin:'0 0 1px' }}>{label}</p>
                  <p style={{ color:'#374151', fontSize:10, fontFamily:dm, margin:0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scan Stats */}
          <div className="nft-up" style={{ animationDelay:'140ms', background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'18px' }}>
            <h3 style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, fontFamily:syne, margin:'0 0 14px' }}>Platform Stats</h3>
            {[
              { label:'Total Scans',    val:'48,291',  col:'#3b82f6' },
              { label:'Scams Detected', val:'3,847',   col:'#ef4444' },
              { label:'Safe NFTs',      val:'44,444',  col:'#22c55e' },
              { label:'Avg Scan Time',  val:'2.4s',    col:'#8b5cf6' },
            ].map(({ label, val, col }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ color:'#6b7280', fontSize:12, fontFamily:dm }}>{label}</span>
                <span style={{ color:col, fontSize:13, fontWeight:700, fontFamily:mono }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
