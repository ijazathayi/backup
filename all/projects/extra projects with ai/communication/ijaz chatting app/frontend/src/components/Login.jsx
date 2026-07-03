import React, { useState, useEffect } from 'react';
import { X, Phone, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3001');

const AvatarPlaceholder = ({ name = '', size = 60 }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = [
    'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
    'linear-gradient(135deg,#3ecf70,#2b8a4e)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#ef4444,#b91c1c)',
    'linear-gradient(135deg,#ec4899,#9d174d)',
  ];
  const bg = colors[(name.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.35,
      flexShrink: 0, border: '2px solid rgba(255,255,255,0.15)',
    }}>{initials}</div>
  );
};

const Login = () => {
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [step, setStep] = useState(0); // 0=saved 1=enter phone 2=otp
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtherMethods, setShowOtherMethods] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('savedAccounts');
    if (stored) {
      const accs = JSON.parse(stored);
      setSavedAccounts(accs);
      setStep(accs.length > 0 ? 0 : 1);
    } else {
      setStep(1);
    }
  }, []);

  const saveAccount = (user) => {
    let accs = JSON.parse(localStorage.getItem('savedAccounts') || '[]');
    accs = accs.filter(a => a.phone_number !== user.phone_number);
    accs.push({ id: user.id, name: user.name, phone_number: user.phone_number, avatar: user.avatar });
    localStorage.setItem('savedAccounts', JSON.stringify(accs));
    setSavedAccounts(accs);
  };

  const removeAccount = (e, phone) => {
    e.stopPropagation();
    let accs = JSON.parse(localStorage.getItem('savedAccounts') || '[]');
    accs = accs.filter(a => a.phone_number !== phone);
    localStorage.setItem('savedAccounts', JSON.stringify(accs));
    setSavedAccounts(accs);
    if (accs.length === 0) setStep(1);
  };

  const handleSavedLogin = async (phone) => {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/saved_login`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone })
      });
      const data = await res.json();
      if (res.ok && data.success) { saveAccount(data.user); window.location.href = '/'; }
      else { setError(data.error || 'Login failed'); setStep(1); }
    } catch (err) {
      console.error('Saved login failed:', err);
      setError('Network error. Please make sure the backend server is running.');
    }
    finally { setLoading(false); }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (phoneNumber.replace(/\s/g, '').length < 8) {
      setError('Please enter a valid phone number'); setLoading(false); return;
    }
    try {
      const res = await fetch(`${API}/auth/otp/request`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber })
      });
      const data = await res.json();
      if (res.ok && data.success) setStep(2);
      else setError(data.error || 'Failed to send OTP');
    } catch (err) {
      console.error('OTP request failed:', err);
      setError('Network error. Please make sure the backend server is running.');
    }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/otp/verify`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, code: otp, name: name })
      });
      const data = await res.json();
      if (res.ok && data.success) { saveAccount(data.user); window.location.href = '/'; }
      else setError(data.error || 'Invalid OTP. Please try again.');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError('Network error. Please make sure the backend server is running.');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="login-container glass-panel">

      {/* Icon */}
      <div className="login-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
          fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h1 className="login-title">Private Chat</h1>
      <p className="login-subtitle">Your conversations, secured end-to-end.</p>

      {/* ── SAVED ACCOUNTS ── */}
      {step === 0 && (
        <div style={{ width: '100%' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', textAlign: 'center' }}>
            Choose your account to continue
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {savedAccounts.map(acc => (
              <div
                key={acc.phone_number}
                className="saved-account-card"
                onClick={() => handleSavedLogin(acc.phone_number)}
              >
                <button className="remove-btn" onClick={(e) => removeAccount(e, acc.phone_number)}><X size={11} /></button>
                {acc.avatar
                  ? <img src={acc.avatar} alt={acc.name} style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                  : <AvatarPlaceholder name={acc.name} size={54} />
                }
                <span className="saved-account-name">{acc.name || acc.phone_number}</span>
              </div>
            ))}
          </div>
          <button className="btn" style={{ width: '100%', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '13px', border: '1px dashed var(--border-color)' }}
            onClick={() => setStep(1)}>
            + Add Another Account
          </button>
          <hr className="divider" />
        </div>
      )}

      {/* ── ENTER PHONE ── */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} style={{ width: '100%' }}>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input className="form-input" type="text" placeholder="Enter your name (optional)"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={12} /> Phone Number
            </label>
            <input className="form-input" type="tel" placeholder="+91 9876543210"
              value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
          </div>
          {error && <div style={{ color: '#e55353', fontSize: '13px', marginBottom: '12px', padding: '8px 12px', background: 'rgba(229,83,83,0.08)', borderRadius: '8px', border: '1px solid rgba(229,83,83,0.2)' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Sending...' : <><span>Send OTP</span> <ArrowRight size={15} /></>}
          </button>
          {savedAccounts.length > 0 && (
            <button type="button" style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', marginTop: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => setStep(0)}>
              ← Back to saved accounts
            </button>
          )}
          <hr className="divider" />
        </form>
      )}

      {/* ── OTP VERIFY ── */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <ShieldCheck size={36} color="var(--accent-color)" style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              We sent a 6-digit code to<br />
              <strong style={{ color: 'var(--text-primary)' }}>{phoneNumber}</strong>
            </p>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Enter OTP</label>
            <input className="form-input otp-input" type="text" placeholder="• • • • • •"
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6} required autoFocus />
          </div>
          {error && <div style={{ color: '#e55353', fontSize: '13px', marginBottom: '12px', padding: '8px 12px', background: 'rgba(229,83,83,0.08)', borderRadius: '8px', border: '1px solid rgba(229,83,83,0.2)' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || otp.length < 6}>
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => { setStep(1); setOtp(''); setError(''); }}>
              ← Change number
            </button>
            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}
              onClick={handleSendOTP} disabled={loading}>
              <RefreshCw size={12} /> Resend
            </button>
          </div>
          <hr className="divider" />
        </form>
      )}

      {/* ── Google login ── */}
      {(step === 0 || step === 1) && (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <button className="btn" style={{ width: '100%', fontSize: '13px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', marginBottom: showOtherMethods ? '12px' : 0 }}
            onClick={() => setShowOtherMethods(!showOtherMethods)}>
            Other sign-in options
          </button>
          {showOtherMethods && (
            <button className="btn btn-google" style={{ width: '100%' }}
              onClick={() => window.location.href = `${API}/auth/google`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Continue with Google
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Login;
