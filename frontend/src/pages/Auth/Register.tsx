import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Shield, ArrowRight, Github, Chrome, Wallet, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  .reg * { box-sizing: border-box; }
  @keyframes reg-up     { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes reg-fade   { from{opacity:0} to{opacity:1} }
  @keyframes reg-shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes reg-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes reg-spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes reg-check  { from{transform:scale(0)} to{transform:scale(1)} }
  .reg-up    { animation: reg-up 0.55s cubic-bezier(.4,0,.2,1) both; }
  .reg-fade  { animation: reg-fade 0.35s ease both; }
  .reg-float { animation: reg-float 4s ease-in-out infinite; }
  .reg-shimmer-text {
    background: linear-gradient(90deg,#3b82f6 0%,#8b5cf6 30%,#06b6d4 60%,#3b82f6 100%);
    background-size: 600px 100%;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    animation: reg-shimmer 4s linear infinite;
  }
  .reg-input-wrap { transition: border-color 0.2s, box-shadow 0.2s; }
  .reg-input-wrap:focus-within { border-color: rgba(59,130,246,0.6) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .reg-btn { transition: all 0.22s cubic-bezier(.34,1.56,.64,1); }
  .reg-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,130,246,0.4); }
  .reg-social { transition: all 0.2s ease; }
  .reg-social:hover { border-color: rgba(59,130,246,0.4) !important; background: rgba(59,130,246,0.06) !important; transform: translateY(-1px); }
  .reg-strength-bar { transition: width 0.4s ease, background 0.4s ease; }
  .reg-bg {
    background:
      radial-gradient(ellipse 60% 50% at 80% 50%, rgba(139,92,246,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 20% 30%, rgba(59,130,246,0.06) 0%, transparent 55%),
      radial-gradient(ellipse 40% 40% at 40% 80%, rgba(6,182,212,0.05) 0%, transparent 50%),
      #040810;
  }
  .reg-grid {
    background-image: linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),
                      linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px);
    background-size: 44px 44px;
  }
  .reg-glow { box-shadow: 0 0 0 1px rgba(139,92,246,0.12), 0 24px 60px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.05); }
  .reg-divider { display:flex; align-items:center; gap:12px; }
  .reg-divider::before,.reg-divider::after { content:''; flex:1; height:1px; background:#1a1f2e; }
  .reg-check-box { width:16px; height:16px; border-radius:4px; border:1.5px solid #1e2130; background:#0d1117; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .reg-check-box.checked { background:#3b82f6; border-color:#3b82f6; }
`

const getStrength = (p: string) => {
  let s = 0
  if (p.length >= 8)           s++
  if (/[A-Z]/.test(p))         s++
  if (/[0-9]/.test(p))         s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

const ROLES = [
  { val: 'learner', label: 'Learner',    desc: 'Learning blockchain',     emoji: '🎓' },
  { val: 'pro',     label: 'Pro Trader', desc: 'Active crypto trader',    emoji: '📈' },
]

export default function Register() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore(s => s.setAuth)

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [role,     setRole]     = useState('learner')
  const [agree,    setAgree]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const strength = getStrength(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'][strength]

  const dm   = 'DM Sans, sans-serif'
  const mono = 'JetBrains Mono, monospace'
  const syne = 'Syne, sans-serif'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 8)          { setError('Password must be at least 8 characters.'); return }
    if (!agree)                        { setError('Please accept the terms to continue.'); return }
    setError('')
    setLoading(true)
    // Mock auth — replace with real API call in Phase 2
    await new Promise(r => setTimeout(r, 1400))
    setAuth({ id: '1', email, role: role as any, createdAt: new Date().toISOString() } as any, 'mock_token_123')
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="reg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      <div className="reg-bg reg-grid" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '8%',   width: 280, height: 280, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(55px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '20%',   right: '10%',  width: 240, height: 240, borderRadius: '50%', background: 'rgba(59,130,246,0.06)',  filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Form card */}
      <div className="reg-up reg-glow" style={{ animationDelay: '0ms', width: '100%', maxWidth: 460, background: 'rgba(6,9,18,0.95)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: 24, padding: '36px 32px', position: 'relative', zIndex: 1, backdropFilter: 'blur(20px)' }}>

        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.7),transparent)', borderRadius: 99 }} />

        {/* Logo + heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="reg-float" style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#1e1a3e,#1a1f3e)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }}>
            <Shield size={20} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: syne, margin: 0 }}>ChainGuard <span className="reg-shimmer-text">AI</span></p>
            <p style={{ color: '#4b5563', fontSize: 11, fontFamily: mono, margin: 0 }}>Create your account</p>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, fontFamily: syne, margin: '0 0 5px', letterSpacing: '-0.02em' }}>Get started free</h2>
          <p style={{ color: '#4b5563', fontSize: 13, fontFamily: dm, margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>

        {/* Social */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {[{ Icon: Github, label: 'GitHub' }, { Icon: Chrome, label: 'Google' }].map(({ Icon, label }) => (
            <button key={label} className="reg-social" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 12, background: '#0d1117', border: '1px solid #1a1f2e', cursor: 'pointer', fontSize: 13, color: '#9ca3af', fontFamily: dm }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
        <button className="reg-social" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 12, background: '#0d1117', border: '1px solid #1a1f2e', cursor: 'pointer', fontSize: 13, color: '#9ca3af', fontFamily: dm, marginBottom: 18 }}>
          <Wallet size={15} style={{ color: '#8b5cf6' }} /> Sign up with Ethereum Wallet
        </button>

        <div className="reg-divider" style={{ marginBottom: 18 }}>
          <span style={{ color: '#374151', fontSize: 11, fontFamily: mono, whiteSpace: 'nowrap' }}>or sign up with email</span>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#6b7280', fontSize: 11, fontFamily: mono, letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>I AM A</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {ROLES.map(r => (
              <button key={r.val} type="button" onClick={() => setRole(r.val)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                  background: role === r.val ? 'rgba(139,92,246,0.1)' : '#0d1117',
                  border: `1px solid ${role === r.val ? 'rgba(139,92,246,0.45)' : '#1a1f2e'}`,
                }}>
                <span style={{ fontSize: 18 }}>{r.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ color: role === r.val ? '#c4b5fd' : '#9ca3af', fontSize: 12, fontWeight: 600, fontFamily: dm, margin: 0 }}>{r.label}</p>
                  <p style={{ color: '#374151', fontSize: 10, fontFamily: dm, margin: 0 }}>{r.desc}</p>
                </div>
                {role === r.val && <CheckCircle size={13} style={{ color: '#8b5cf6', marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="reg-fade" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <p style={{ color: '#fca5a5', fontSize: 12, fontFamily: dm, margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

          {/* Name */}
          <div>
            <label style={{ color: '#6b7280', fontSize: 11, fontFamily: mono, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>FULL NAME</label>
            <div className="reg-input-wrap" style={{ background: '#0d1117', border: '1px solid #1a1f2e', borderRadius: 12, padding: '11px 14px' }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Satoshi Nakamoto" autoComplete="name"
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13, fontFamily: dm }} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ color: '#6b7280', fontSize: 11, fontFamily: mono, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>EMAIL</label>
            <div className="reg-input-wrap" style={{ background: '#0d1117', border: '1px solid #1a1f2e', borderRadius: 12, padding: '11px 14px' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13, fontFamily: dm }} />
            </div>
          </div>

          {/* Password + strength */}
          <div>
            <label style={{ color: '#6b7280', fontSize: 11, fontFamily: mono, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <div className="reg-input-wrap" style={{ background: '#0d1117', border: '1px solid #1a1f2e', borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters" autoComplete="new-password"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13, fontFamily: dm }} />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#374151', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {/* Strength meter */}
            {password && (
              <div className="reg-fade" style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? strengthColor : '#1a1f2e', transition: 'background 0.3s ease' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#374151', fontSize: 10, fontFamily: dm }}>Password strength</span>
                  <span style={{ color: strengthColor, fontSize: 10, fontFamily: mono, fontWeight: 600 }}>{strengthLabel}</span>
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div className={`reg-check-box ${agree ? 'checked' : ''}`} onClick={() => setAgree(v => !v)} style={{ marginTop: 1 }}>
              {agree && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
            </div>
            <p style={{ color: '#6b7280', fontSize: 12, fontFamily: dm, margin: 0, lineHeight: 1.6, cursor: 'pointer' }} onClick={() => setAgree(v => !v)}>
              I agree to the{' '}
              <span style={{ color: '#8b5cf6' }}>Terms of Service</span> and{' '}
              <span style={{ color: '#8b5cf6' }}>Privacy Policy</span>
            </p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !agree} className="reg-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 13,
              background: loading || !agree ? '#1a1f2e' : 'linear-gradient(135deg,#7c3aed,#2563eb)',
              border: 'none', color: loading || !agree ? '#374151' : '#fff',
              fontSize: 14, fontWeight: 700, fontFamily: syne, cursor: loading || !agree ? 'not-allowed' : 'pointer', marginTop: 2 }}>
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #374151', borderTopColor: '#6b7280', animation: 'reg-spin 0.8s linear infinite' }} />
                Creating account...
              </>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>

      {/* Right side feature panel */}
      <div className="reg-up" style={{ animationDelay: '80ms', flex: 1, maxWidth: 400, paddingLeft: 56, position: 'relative', zIndex: 1 }}>
        <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 900, fontFamily: syne, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          What you'll get
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { emoji: '🎓', title: 'Full blockchain education',  desc: '6 modules, 30 quizzes, progress tracking — learn at your own pace' },
            { emoji: '📊', title: 'Live market analytics',      desc: 'Real-time prices, charts, Fear & Greed Index, market dominance data' },
            { emoji: '🛡️', title: 'NFT risk scanning',         desc: 'AI analysis across 6 risk factors — never get rugged again' },
            { emoji: '🤖', title: 'GPT-4o AI assistant',        desc: 'Blockchain-specialized chatbot with RAG knowledge base' },
          ].map(({ emoji, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {emoji}
              </div>
              <div>
                <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, fontFamily: dm, margin: '0 0 3px' }}>{title}</p>
                <p style={{ color: '#4b5563', fontSize: 12, fontFamily: dm, margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: '16px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 14 }}>
          <p style={{ color: '#c4b5fd', fontSize: 13, fontFamily: dm, margin: 0, lineHeight: 1.7 }}>
            💜 <strong>Free forever</strong> — no credit card required. Built by a student, for everyone learning blockchain.
          </p>
        </div>
      </div>
    </div>
  )
}