import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Shield, ArrowRight, Github, Chrome, Wallet } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
  .auth * { box-sizing: border-box; }

  @keyframes auth-up    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes auth-fade  { from{opacity:0} to{opacity:1} }
  @keyframes auth-float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    33%      { transform: translateY(-8px) rotate(1deg); }
    66%      { transform: translateY(-4px) rotate(-1deg); }
  }
  @keyframes auth-shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes auth-spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes auth-pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0;   }
  }
  @keyframes auth-node-drift {
    0%   { transform: translate(0,0)      opacity: 0;   }
    10%  { opacity: 0.6; }
    90%  { opacity: 0.3; }
    100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
  }

  .auth-up   { animation: auth-up  0.55s cubic-bezier(.4,0,.2,1) both; }
  .auth-fade { animation: auth-fade 0.4s ease both; }

  .auth-shimmer-text {
    background: linear-gradient(90deg,#3b82f6 0%,#8b5cf6 30%,#06b6d4 60%,#3b82f6 100%);
    background-size: 600px 100%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    animation: auth-shimmer 4s linear infinite;
  }

  .auth-logo-float { animation: auth-float 5s ease-in-out infinite; }

  .auth-input-wrap {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .auth-input-wrap:focus-within {
    border-color: rgba(59,130,246,0.6) !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .auth-btn-primary {
    transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
  }
  .auth-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(59,130,246,0.45);
  }
  .auth-btn-primary:active:not(:disabled) { transform: translateY(0); }

  .auth-social-btn {
    transition: all 0.2s ease;
  }
  .auth-social-btn:hover {
    border-color: rgba(59,130,246,0.4) !important;
    background: rgba(59,130,246,0.06) !important;
    transform: translateY(-1px);
  }

  .auth-bg {
    background:
      radial-gradient(ellipse 70% 50% at 20% 50%, rgba(59,130,246,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 80% 30%, rgba(139,92,246,0.06) 0%, transparent 55%),
      radial-gradient(ellipse 40% 40% at 60% 80%, rgba(6,182,212,0.05) 0%, transparent 50%),
      #040810;
  }

  .auth-grid {
    background-image:
      linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  .auth-card-glow {
    box-shadow:
      0 0 0 1px rgba(59,130,246,0.12),
      0 24px 60px rgba(0,0,0,0.6),
      0 0 80px rgba(59,130,246,0.05);
  }

  .auth-divider {
    display: flex; align-items: center; gap: 12px;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: #1a1f2e;
  }

  .auth-check {
    width: 16px; height: 16px; border-radius: 4px;
    border: 1.5px solid #1e2130; background: #0d1117;
    cursor: pointer; transition: all 0.2s ease;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .auth-check.checked {
    background: #3b82f6; border-color: #3b82f6;
  }
`

export default function Login() {
  const navigate    = useNavigate()
  const setAuth     = useAuthStore(s => s.setAuth)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const dm   = 'DM Sans, sans-serif'
  const mono = 'JetBrains Mono, monospace'
  const syne = 'Syne, sans-serif'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    // Mock auth — replace with real API call in Phase 2
    await new Promise(r => setTimeout(r, 1200))
    setAuth({ id: '1', email, role: 'learner', createdAt: new Date().toISOString() } as any, 'mock_token_123')
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="auth" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* Background */}
      <div className="auth-bg auth-grid" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />

      {/* Decorative orbs */}
      <div style={{ position: 'fixed', top: '15%', left: '8%',  width: 300, height: 300, borderRadius: '50%', background: 'rgba(59,130,246,0.06)',  filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Left panel — branding (hidden on small screens) */}
      <div className="auth-up" style={{ animationDelay: '0ms', flex: 1, maxWidth: 480, paddingRight: 60, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="auth-logo-float" style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#1e3a5f,#1a1f3e)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
            <Shield size={22} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: syne, margin: 0 }}>ChainGuard</p>
            <p style={{ color: '#3b82f6', fontSize: 11, fontFamily: mono, margin: 0, letterSpacing: '0.08em' }}>AI PLATFORM</p>
          </div>
        </div>

        {/* Headline */}
        <div>
          <h1 style={{ fontFamily: syne, fontSize: 42, fontWeight: 900, color: '#fff', margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Your blockchain<br />
            <span className="auth-shimmer-text">command center.</span>
          </h1>
          <p style={{ color: '#4b5563', fontSize: 15, fontFamily: dm, margin: 0, lineHeight: 1.7 }}>
            Education · Analytics · NFT Risk · AI Assistant.<br />
            Everything you need in one intelligent platform.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { emoji: '🎓', label: 'Learn blockchain from zero to expert' },
            { emoji: '📊', label: 'Live crypto charts & market analytics' },
            { emoji: '🛡️', label: 'AI-powered NFT risk scanner' },
            { emoji: '🤖', label: 'GPT-4o blockchain AI assistant' },
          ].map(({ emoji, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{emoji}</span>
              <span style={{ color: '#6b7280', fontSize: 13, fontFamily: dm }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32 }}>
          {[['6', 'Modules'], ['30', 'Quiz Questions'], ['6', 'Risk Factors']].map(([v, l]) => (
            <div key={l}>
              <p style={{ color: '#3b82f6', fontSize: 24, fontWeight: 900, fontFamily: syne, margin: '0 0 2px', letterSpacing: '-0.02em' }}>{v}</p>
              <p style={{ color: '#374151', fontSize: 11, fontFamily: dm, margin: 0 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-up auth-card-glow" style={{ animationDelay: '80ms', width: '100%', maxWidth: 420, background: 'rgba(6,9,18,0.95)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 24, padding: '36px 32px', position: 'relative', zIndex: 1, backdropFilter: 'blur(20px)' }}>

        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(59,130,246,0.6),transparent)', borderRadius: 99 }} />

        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, fontFamily: syne, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Welcome back</h2>
          <p style={{ color: '#4b5563', fontSize: 13, fontFamily: dm, margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>Sign up free →</Link>
          </p>
        </div>

        {/* Social buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { Icon: Github,  label: 'GitHub',  col: '#e2e8f0' },
            { Icon: Chrome,  label: 'Google',  col: '#e2e8f0' },
          ].map(({ Icon, label, col }) => (
            <button key={label} className="auth-social-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 12, background: '#0d1117', border: '1px solid #1a1f2e', cursor: 'pointer', fontFamily: dm, fontSize: 13, color: '#9ca3af' }}>
              <Icon size={16} style={{ color: col }} />
              {label}
            </button>
          ))}
        </div>

        {/* Wallet button */}
        <button className="auth-social-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 12, background: '#0d1117', border: '1px solid #1a1f2e', cursor: 'pointer', fontFamily: dm, fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
          <Wallet size={16} style={{ color: '#8b5cf6' }} />
          Sign in with Ethereum Wallet
        </button>

        {/* Divider */}
        <div className="auth-divider" style={{ marginBottom: 20 }}>
          <span style={{ color: '#374151', fontSize: 11, fontFamily: mono, whiteSpace: 'nowrap' }}>or continue with email</span>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-fade" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ color: '#fca5a5', fontSize: 12, fontFamily: dm, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Email */}
          <div>
            <label style={{ color: '#6b7280', fontSize: 11, fontFamily: mono, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>EMAIL</label>
            <div className="auth-input-wrap" style={{ background: '#0d1117', border: '1px solid #1a1f2e', borderRadius: 12, padding: '11px 14px' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13, fontFamily: dm }} />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ color: '#6b7280', fontSize: 11, fontFamily: mono, letterSpacing: '0.06em' }}>PASSWORD</label>
              <Link to="/forgot-password" style={{ color: '#3b82f6', fontSize: 11, fontFamily: dm, textDecoration: 'none' }}>Forgot?</Link>
            </div>
            <div className="auth-input-wrap" style={{ background: '#0d1117', border: '1px solid #1a1f2e', borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13, fontFamily: dm }} />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#374151', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className={`auth-check ${remember ? 'checked' : ''}`} onClick={() => setRemember(v => !v)}>
              {remember && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ color: '#6b7280', fontSize: 12, fontFamily: dm, cursor: 'pointer' }} onClick={() => setRemember(v => !v)}>
              Remember me for 7 days
            </span>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="auth-btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 13, background: loading ? '#1a1f2e' : 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', color: loading ? '#374151' : '#fff', fontSize: 14, fontWeight: 700, fontFamily: syne, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.01em', marginTop: 4 }}>
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #374151', borderTopColor: '#6b7280', animation: 'auth-spin-slow 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Terms */}
        <p style={{ color: '#1f2937', fontSize: 10, fontFamily: dm, textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          By signing in you agree to our{' '}
          <span style={{ color: '#374151', cursor: 'pointer' }}>Terms of Service</span> and{' '}
          <span style={{ color: '#374151', cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}