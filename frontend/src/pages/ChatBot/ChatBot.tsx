import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare, Send, Zap, BookOpen, BarChart2,
  Shield, Sparkles, Copy, ThumbsUp, ThumbsDown,
  RotateCcw, ChevronRight, Bot, User
} from 'lucide-react'
import api from '@/services/api'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  .chat * { box-sizing: border-box; }
  @keyframes chat-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes chat-fade { from{opacity:0} to{opacity:1} }
  @keyframes chat-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes chat-shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes chat-typing { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
  @keyframes chat-msg-in { from{opacity:0;transform:translateY(10px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
  .chat-up   { animation: chat-up 0.45s cubic-bezier(.4,0,.2,1) both; }
  .chat-fade { animation: chat-fade 0.3s ease both; }
  .chat-shimmer {
    background: linear-gradient(90deg,#3b82f6 0%,#8b5cf6 30%,#06b6d4 60%,#3b82f6 100%);
    background-size: 600px 100%;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    animation: chat-shimmer 4s linear infinite;
  }
  .chat-msg { animation: chat-msg-in 0.35s cubic-bezier(.34,1.2,.64,1) both; }
  .chat-dot { animation: chat-typing 1.2s ease infinite; }
  .chat-dot:nth-child(2) { animation-delay: 0.18s; }
  .chat-dot:nth-child(3) { animation-delay: 0.36s; }
  .chat-live { animation: chat-pulse 2s ease infinite; }
  .chat-input-area { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .chat-input-area:focus-within { border-color: rgba(59,130,246,0.5) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
  .chat-suggestion { transition: all 0.2s cubic-bezier(.34,1.2,.64,1); cursor: pointer; }
  .chat-suggestion:hover { transform: translateY(-2px); border-color: rgba(59,130,246,0.4) !important; background: rgba(59,130,246,0.06) !important; }
  .chat-action { transition: all 0.18s ease; cursor: pointer; opacity: 0; }
  .chat-bubble:hover .chat-action { opacity: 1; }
  .chat-sidebar-item { transition: all 0.18s ease; cursor: pointer; }
  .chat-sidebar-item:hover { background: rgba(59,130,246,0.06) !important; border-color: rgba(59,130,246,0.2) !important; }
  .chat-new-btn { transition: all 0.22s ease; }
  .chat-new-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(59,130,246,0.3); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e2130; border-radius: 99px; }
`

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Mock AI Responses ────────────────────────────────────────────────────────
const AI_RESPONSES: Record<string, string> = {
  default: `Great question! Here's what I know about that topic:

Blockchain technology is a distributed ledger system that enables trustless, transparent record-keeping without requiring a central authority. Here are the key concepts:

**How it works:**
- Transactions are grouped into blocks, each containing a cryptographic hash of the previous block
- This chain structure makes tampering practically impossible — changing any block invalidates all subsequent blocks
- Consensus mechanisms (PoW, PoS) ensure all nodes agree on the valid chain

**Why it matters:**
The innovation isn't just technical — it's the removal of trust requirements. For the first time, two parties who don't know each other can transact directly with a shared, tamper-proof record keeping score.

Is there a specific aspect you'd like me to dive deeper into?`,

  defi: `**DeFi (Decentralized Finance)** is the recreation of traditional financial services on public blockchains — without banks, brokers, or intermediaries.

**Core DeFi Primitives:**

🔄 **Automated Market Makers (AMMs)**
Instead of order books, AMMs use liquidity pools governed by the formula \`x × y = k\`. Uniswap processes $1–5B in daily volume with no accounts or KYC required.

🏦 **Lending Protocols (Aave, Compound)**
Deposit crypto → earn interest. Borrow against collateral. All managed by smart contracts. Liquidation is automated — no human intervention needed.

⚡ **Flash Loans**
The most mind-bending DeFi primitive: borrow millions with zero collateral, as long as you repay within the same transaction block. Used for arbitrage and collateral swaps.

📊 **Current Scale**
- Total Value Locked (TVL): ~$80B across all protocols
- Uniswap alone has processed $1.5 trillion in all-time volume
- Aave manages $10B+ in deposits

Want me to explain any specific protocol or concept in more detail?`,

  nft: `**NFTs (Non-Fungible Tokens)** are blockchain-based tokens where each unit is unique and non-interchangeable.

**Token Standards:**
- **ERC-721** — One token = one unique asset. The original NFT standard.
- **ERC-1155** — Multi-token standard. One contract can hold both fungible and non-fungible tokens. 5x more gas efficient.
- **ERC-6551** — Token-bound accounts. NFTs that can own other assets.

**Real Use Cases Beyond Speculation:**
🎨 Digital art with verifiable provenance
🎮 In-game items with true ownership (transferable between games)
🪪 Soulbound tokens — non-transferable credentials (diplomas, certifications)
🏠 Real estate tokenization — fractional ownership
🎵 Music royalties — Sound.xyz, Royal.io

**NFT Risk Factors to Watch:**
⚠️ Rug pulls — anonymous teams, unrealistic promises
⚠️ Wash trading — artificial volume inflation
⚠️ IPFS integrity — broken metadata links = your NFT becomes blank
⚠️ Contract honeypots — buy but can't sell

Use the ChainGuard NFT Scanner to analyze any NFT for these risk factors!`,

  ethereum: `**Ethereum** is the world's leading programmable blockchain, launched in 2015 by Vitalik Buterin.

**What makes Ethereum special:**
Unlike Bitcoin (designed for currency), Ethereum is a general-purpose blockchain computer. The Ethereum Virtual Machine (EVM) executes smart contracts — self-executing code that runs exactly as programmed.

**The Merge (September 2022):**
Ethereum transitioned from Proof of Work to Proof of Stake, reducing energy consumption by **99.95%**. 900,000+ validators now secure the network.

**Current Stats:**
- Market Cap: ~$420B
- Validators: 900,000+
- Daily transactions: 1M+
- Smart contracts deployed: 50M+
- DeFi TVL secured: $50B+

**The Roadmap ahead:**
- **Surge** — Rollup scaling via EIP-4844 (proto-danksharding)
- **Verge** — Verkle trees for stateless clients
- **Purge** — Historical data pruning
- **Splurge** — Miscellaneous improvements

Target: 100,000+ TPS via Layer 2s + danksharding, while maintaining security and decentralization.`,

  bitcoin: `**Bitcoin** is the original cryptocurrency, created by the pseudonymous Satoshi Nakamoto in 2008.

**The Genesis Block (Jan 3, 2009):**
Embedded message: *"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"* — a direct commentary on traditional finance failures.

**Key Properties:**
- **Fixed Supply** — 21 million BTC maximum. ~19.7M mined so far.
- **Halving** — Block reward halves every 210,000 blocks (~4 years). April 2024: 6.25 → 3.125 BTC
- **Proof of Work** — Miners compete to find valid hashes. Current hashrate: ~600 EH/s
- **10-minute blocks** — Difficulty auto-adjusts every 2016 blocks

**The Security Model:**
Attacking Bitcoin requires controlling 51%+ of the network hashrate — currently worth $20B+ in hardware, plus ongoing electricity costs. The economic incentive to be honest vastly outweighs the incentive to attack.

**Bitcoin vs Ethereum:**
| | Bitcoin | Ethereum |
|---|---|---|
| Purpose | Digital gold / store of value | Programmable smart contracts |
| Consensus | Proof of Work | Proof of Stake |
| Supply | Fixed 21M | Deflationary (EIP-1559) |
| Speed | ~7 TPS | ~15 TPS (+ L2s) |

Want to know more about Bitcoin's scripting language, Lightning Network, or its role as institutional collateral?`,
}

const getResponse = (msg: string): string => {
  const lower = msg.toLowerCase()
  if (lower.includes('defi') || lower.includes('uniswap') || lower.includes('aave') || lower.includes('lending')) return AI_RESPONSES.defi
  if (lower.includes('nft') || lower.includes('non-fungible') || lower.includes('opensea')) return AI_RESPONSES.nft
  if (lower.includes('ethereum') || lower.includes('eth') || lower.includes('smart contract') || lower.includes('evm')) return AI_RESPONSES.ethereum
  if (lower.includes('bitcoin') || lower.includes('btc') || lower.includes('satoshi') || lower.includes('proof of work')) return AI_RESPONSES.bitcoin
  return AI_RESPONSES.default
}

// ─── Suggestions ──────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: Zap,          text: 'How does DeFi work?',              color: '#3b82f6' },
  { icon: Shield,       text: 'What makes an NFT risky?',         color: '#ef4444' },
  { icon: BarChart2,    text: 'Explain Ethereum vs Bitcoin',       color: '#8b5cf6' },
  { icon: BookOpen,     text: 'What is a smart contract?',         color: '#10b981' },
  { icon: Sparkles,     text: 'How do ZK-Rollups work?',          color: '#f59e0b' },
  { icon: ChevronRight, text: 'Explain Proof of Stake simply',    color: '#06b6d4' },
]

const HISTORY = [
  { title: 'DeFi yield strategies', time: 'Today' },
  { title: 'NFT rug pull red flags', time: 'Today' },
  { title: 'Ethereum gas fees', time: 'Yesterday' },
  { title: 'Bitcoin halving 2024', time: 'Yesterday' },
  { title: 'Layer 2 comparison', time: '3 days ago' },
  { title: 'Solana vs Ethereum', time: '5 days ago' },
]

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────
function RenderMessage({ content }: { content: string }) {
  const dm   = 'DM Sans, sans-serif'
  const mono = 'JetBrains Mono, monospace'

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  lines.forEach((line, i) => {
    // Bold headers with **
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push(<p key={i} style={{ color:'#fff', fontWeight:700, fontSize:13, fontFamily:dm, margin:'10px 0 4px' }}>{line.slice(2,-2)}</p>)
    }
    // Bullet points
    else if (line.startsWith('- ') || line.startsWith('• ')) {
      const text = line.slice(2)
      // Inline bold
      const parts = text.split(/\*\*(.*?)\*\*/g)
      elements.push(
        <div key={i} style={{ display:'flex', gap:8, margin:'3px 0' }}>
          <span style={{ color:'#3b82f6', flexShrink:0, marginTop:2 }}>◆</span>
          <p style={{ color:'#94a3b8', fontSize:13, fontFamily:dm, margin:0, lineHeight:1.7 }}>
            {parts.map((p,j) => j%2===1 ? <strong key={j} style={{ color:'#e2e8f0', fontWeight:600 }}>{p}</strong> : p)}
          </p>
        </div>
      )
    }
    // Emoji bullets
    else if (/^[🔄🏦⚡📊🎨🎮🪪🏠🎵⚠️]/.test(line)) {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      elements.push(
        <p key={i} style={{ color:'#94a3b8', fontSize:13, fontFamily:dm, margin:'4px 0', lineHeight:1.7 }}>
          {parts.map((p,j) => j%2===1 ? <strong key={j} style={{ color:'#e2e8f0', fontWeight:600 }}>{p}</strong> : p)}
        </p>
      )
    }
    // Table rows
    else if (line.startsWith('|')) {
      const cells = line.split('|').filter(c => c.trim() && !c.match(/^[-\s]+$/))
      if (cells.length > 0 && !line.match(/^\|[-\s|]+\|$/)) {
        elements.push(
          <div key={i} style={{ display:'grid', gridTemplateColumns:`repeat(${cells.length},1fr)`, borderBottom:'1px solid #1a1f2e', padding:'6px 0' }}>
            {cells.map((c, ci) => (
              <span key={ci} style={{ color: ci===0||i===elements.filter(e=>e).length ? '#9ca3af' : '#6b7280', fontSize:11, fontFamily:mono }}>{c.trim()}</span>
            ))}
          </div>
        )
      }
    }
    // Code inline
    else if (line.includes('`')) {
      const parts = line.split(/`([^`]+)`/g)
      elements.push(
        <p key={i} style={{ color:'#94a3b8', fontSize:13, fontFamily:dm, margin:'4px 0', lineHeight:1.8 }}>
          {parts.map((p,j) => j%2===1
            ? <code key={j} style={{ color:'#06b6d4', background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:4, padding:'1px 6px', fontSize:12, fontFamily:mono }}>{p}</code>
            : p.split(/\*\*(.*?)\*\*/g).map((pp,jj) => jj%2===1 ? <strong key={jj} style={{ color:'#e2e8f0', fontWeight:600 }}>{pp}</strong> : pp)
          )}
        </p>
      )
    }
    // Normal paragraphs
    else if (line.trim()) {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      elements.push(
        <p key={i} style={{ color:'#94a3b8', fontSize:13, fontFamily:dm, margin:'4px 0', lineHeight:1.8 }}>
          {parts.map((p,j) => j%2===1 ? <strong key={j} style={{ color:'#e2e8f0', fontWeight:600 }}>{p}</strong> : p)}
        </p>
      )
    }
    // Empty lines
    else {
      elements.push(<div key={i} style={{ height:6 }} />)
    }
  })

  return <div>{elements}</div>
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display:'flex', gap:4, padding:'14px 16px', alignItems:'center' }}>
      {[0,1,2].map(i => (
        <span key={i} className="chat-dot" style={{ width:6, height:6, borderRadius:'50%', background:'#3b82f6', display:'inline-block', animationDelay:`${i*0.18}s` }} />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatBot() {
  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [isTyping, setIsTyping]     = useState(false)
  const [copiedId, setCopiedId]     = useState<string | null>(null)
  const [sessionId, setSessionId]   = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState(HISTORY)
  const bottomRef                   = useRef<HTMLDivElement>(null)
  const inputRef                    = useRef<HTMLTextAreaElement>(null)

  const dm   = 'DM Sans, sans-serif'
  const mono = 'JetBrains Mono, monospace'
  const syne = 'Syne, sans-serif'

  // Load chat sessions on mount
  useEffect(() => {
    api.get('/chat/sessions').then(res => {
      const sessions = res.data.data || []
      if (sessions.length > 0) {
        setChatHistory(sessions.slice(0, 6).map((s: any) => ({
          title: s.title || 'Chat Session',
          time: new Date(s.created_at).toLocaleDateString(),
          id: s.id,
        })))
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim()
    if (!content) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      // Create session if needed
      let sid = sessionId
      if (!sid) {
        const sessionRes = await api.post('/chat/sessions', { title: content.slice(0, 40) })
        sid = sessionRes.data.data.id
        setSessionId(sid)
      }

      // Send message to backend
      const { data } = await api.post(`/chat/sessions/${sid}/messages`, { content })
      const aiContent = data.data?.aiMessage?.content || data.data?.content || getResponse(content)
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      // Fallback to local mock responses if API fails
      const thinkTime = 800 + Math.random() * 1200
      await new Promise(r => setTimeout(r, thinkTime))
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getResponse(content),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const clearChat = () => { setMessages([]); setIsTyping(false); setSessionId(null) }

  return (
    <div className="chat" style={{ display:'flex', flexDirection:'column', gap:0, height:'calc(100vh - 120px)' }}>
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <div className="chat-up" style={{ animationDelay:'0ms', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <MessageSquare size={22} style={{ color:'#8b5cf6' }} />
          </div>
          <div>
            <h1 style={{ fontFamily:syne, fontSize:22, fontWeight:900, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>AI Assistant</h1>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span className="chat-live" style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />
              <p style={{ color:'#4b5563', fontSize:12, fontFamily:dm, margin:0 }}>GPT-4o · RAG-enhanced · Blockchain specialist</p>
            </div>
          </div>
        </div>
        <button onClick={clearChat} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:10, background:'#0d1117', border:'1px solid #1e2130', color:'#6b7280', fontSize:12, cursor:'pointer', fontFamily:dm, transition:'all 0.18s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#374151';(e.currentTarget as HTMLElement).style.color='#9ca3af'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1e2130';(e.currentTarget as HTMLElement).style.color='#6b7280'}}>
          <RotateCcw size={13} /> New Chat
        </button>
      </div>

      {/* ── Main Layout: Chat + Sidebar ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:14, flex:1, minHeight:0 }}>

        {/* ── Chat Area ── */}
        <div style={{ display:'flex', flexDirection:'column', minHeight:0, background:'#060912', border:'1px solid #0f1520', borderRadius:20, overflow:'hidden' }}>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16 }}>

            {/* Empty state / welcome */}
            {messages.length === 0 && (
              <div className="chat-fade" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'20px', gap:20 }}>
                {/* Bot avatar */}
                <div style={{ position:'relative' }}>
                  <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Bot size={32} style={{ color:'#8b5cf6' }} />
                  </div>
                  <div style={{ position:'absolute', bottom:-3, right:-3, width:18, height:18, borderRadius:'50%', background:'#22c55e', border:'2px solid #060912', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:9 }}>✓</span>
                  </div>
                </div>

                <div>
                  <h2 style={{ color:'#fff', fontSize:20, fontWeight:900, fontFamily:syne, margin:'0 0 8px', letterSpacing:'-0.02em' }}>
                    ChainGuard AI Assistant
                  </h2>
                  <p style={{ color:'#4b5563', fontSize:13, fontFamily:dm, margin:0, maxWidth:380 }}>
                    Ask me anything about blockchain, DeFi, NFTs, crypto markets, or security. Powered by GPT-4o with retrieval-augmented generation.
                  </p>
                </div>

                {/* Suggestion chips */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, width:'100%', maxWidth:480 }}>
                  {SUGGESTIONS.map(({ icon: Icon, text, color }) => (
                    <button key={text} onClick={() => sendMessage(text)} className="chat-suggestion"
                      style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:12, background:'#0d1117', border:'1px solid #1a1f2e', textAlign:'left', cursor:'pointer' }}>
                      <div style={{ width:26, height:26, borderRadius:7, background:color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <span style={{ color:'#9ca3af', fontSize:11, fontFamily:dm, lineHeight:1.4 }}>{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg) => (
              <div key={msg.id} className="chat-msg"
                style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection: msg.role==='user' ? 'row-reverse' : 'row' }}>

                {/* Avatar */}
                <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  background: msg.role==='assistant' ? 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))' : 'rgba(99,102,241,0.15)',
                  border: `1px solid ${msg.role==='assistant' ? 'rgba(139,92,246,0.3)' : 'rgba(99,102,241,0.3)'}`,
                }}>
                  {msg.role==='assistant' ? <Bot size={16} style={{ color:'#8b5cf6' }} /> : <User size={16} style={{ color:'#6366f1' }} />}
                </div>

                {/* Bubble */}
                <div className="chat-bubble" style={{ maxWidth:'78%', position:'relative' }}>
                  <div style={{
                    padding: msg.role==='assistant' ? '14px 16px' : '10px 14px',
                    borderRadius: msg.role==='assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    background: msg.role==='assistant' ? '#0d1117' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                    border: msg.role==='assistant' ? '1px solid #1a1f2e' : 'none',
                  }}>
                    {msg.role==='assistant'
                      ? <RenderMessage content={msg.content} />
                      : <p style={{ color:'#fff', fontSize:13, fontFamily:dm, margin:0, lineHeight:1.7 }}>{msg.content}</p>
                    }
                  </div>

                  {/* Actions for assistant messages */}
                  {msg.role==='assistant' && (
                    <div style={{ display:'flex', gap:4, marginTop:6, paddingLeft:4 }}>
                      <button className="chat-action" onClick={() => copyMessage(msg.id, msg.content)}
                        style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:6, background:'#0d1117', border:'1px solid #1a1f2e', color: copiedId===msg.id ? '#22c55e' : '#374151', fontSize:10, fontFamily:dm }}>
                        <Copy size={10} /> {copiedId===msg.id ? 'Copied!' : 'Copy'}
                      </button>
                      <button className="chat-action"
                        style={{ padding:'3px 8px', borderRadius:6, background:'#0d1117', border:'1px solid #1a1f2e', color:'#374151', fontSize:10, display:'flex', alignItems:'center', gap:4, fontFamily:dm }}>
                        <ThumbsUp size={10} /> Good
                      </button>
                      <button className="chat-action"
                        style={{ padding:'3px 8px', borderRadius:6, background:'#0d1117', border:'1px solid #1a1f2e', color:'#374151', fontSize:10, display:'flex', alignItems:'center', gap:4, fontFamily:dm }}>
                        <ThumbsDown size={10} /> Bad
                      </button>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p style={{ color:'#1f2937', fontSize:9, fontFamily:mono, margin:'3px 0 0', textAlign: msg.role==='user' ? 'right' : 'left' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="chat-msg" style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))', border:'1px solid rgba(139,92,246,0.3)' }}>
                  <Bot size={16} style={{ color:'#8b5cf6' }} />
                </div>
                <div style={{ background:'#0d1117', border:'1px solid #1a1f2e', borderRadius:'4px 16px 16px 16px', minWidth:60 }}>
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input Area ── */}
          <div style={{ padding:'12px 16px', borderTop:'1px solid #0f1520', background:'#060912' }}>
            <div className="chat-input-area" style={{ display:'flex', gap:10, alignItems:'flex-end', background:'#0d1117', border:'1px solid #1a1f2e', borderRadius:14, padding:'10px 12px' }}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask about blockchain, DeFi, NFTs, smart contracts..."
                rows={1}
                style={{
                  flex:1, background:'transparent', border:'none', outline:'none', color:'#e2e8f0',
                  fontSize:13, fontFamily:dm, resize:'none', lineHeight:1.6, maxHeight:120, overflowY:'auto',
                  scrollbarWidth:'none',
                }}
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping}
                style={{
                  width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
                  background: input.trim() && !isTyping ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : '#1a1f2e',
                  border:'none', cursor:input.trim()&&!isTyping?'pointer':'not-allowed',
                  transition:'all 0.2s ease', flexShrink:0,
                  boxShadow: input.trim()&&!isTyping ? '0 2px 12px rgba(59,130,246,0.4)' : 'none',
                }}
                onMouseEnter={e=>{ if(input.trim()&&!isTyping) (e.currentTarget as HTMLElement).style.transform='scale(1.08)' }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='scale(1)' }}>
                <Send size={15} style={{ color: input.trim()&&!isTyping ? '#fff' : '#374151' }} />
              </button>
            </div>
            <p style={{ color:'#1f2937', fontSize:10, fontFamily:dm, margin:'6px 0 0', textAlign:'center' }}>
              ChainGuard AI · Powered by GPT-4o with blockchain RAG · Not financial advice
            </p>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, overflowY:'auto' }}>

          {/* New Chat button */}
          <button onClick={clearChat} className="chat-new-btn"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:14, background:'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.1))', border:'1px solid rgba(59,130,246,0.25)', color:'#3b82f6', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:syne }}>
            <Sparkles size={15} /> New Conversation
          </button>

          {/* Chat History */}
          <div style={{ background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'16px', flex:1 }}>
            <h3 style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, fontFamily:syne, margin:'0 0 12px' }}>Recent Chats</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {chatHistory.map((h, i) => (
                <div key={i} className="chat-sidebar-item"
                  style={{ padding:'9px 10px', borderRadius:10, background:'#0d1117', border:'1px solid #1a1f2e' }}>
                  <p style={{ color:'#d1d5db', fontSize:11, fontWeight:600, fontFamily:dm, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.title}</p>
                  <p style={{ color:'#374151', fontSize:10, fontFamily:mono, margin:0 }}>{h.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div style={{ background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'16px' }}>
            <h3 style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, fontFamily:syne, margin:'0 0 12px' }}>Capabilities</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { icon: BookOpen,   label:'Blockchain Education',  col:'#10b981', desc:'Explain any concept' },
                { icon: BarChart2,  label:'Market Analysis',        col:'#3b82f6', desc:'Price & trend insights' },
                { icon: Shield,     label:'NFT Risk Advice',        col:'#ef4444', desc:'Scam & fraud detection' },
                { icon: Zap,        label:'DeFi Guidance',          col:'#f59e0b', desc:'Protocol explanations' },
              ].map(({ icon: Icon, label, col, desc }) => (
                <div key={label} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <div style={{ width:26, height:26, borderRadius:7, background:col+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <Icon size={12} style={{ color:col }} />
                  </div>
                  <div>
                    <p style={{ color:'#d1d5db', fontSize:11, fontWeight:600, fontFamily:dm, margin:'0 0 1px' }}>{label}</p>
                    <p style={{ color:'#374151', fontSize:10, fontFamily:dm, margin:0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model info */}
          <div style={{ background:'#060912', border:'1px solid #0f1520', borderRadius:16, padding:'14px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ color:'#374151', fontSize:11, fontFamily:mono }}>Model</span>
              <span style={{ color:'#8b5cf6', fontSize:11, fontFamily:mono, fontWeight:600 }}>GPT-4o</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ color:'#374151', fontSize:11, fontFamily:mono }}>RAG Enabled</span>
              <span style={{ color:'#22c55e', fontSize:11, fontFamily:mono }}>✓ Active</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ color:'#374151', fontSize:11, fontFamily:mono }}>Vector DB</span>
              <span style={{ color:'#9ca3af', fontSize:11, fontFamily:mono }}>FAISS</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'#374151', fontSize:11, fontFamily:mono }}>Guardrails</span>
              <span style={{ color:'#22c55e', fontSize:11, fontFamily:mono }}>✓ Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}