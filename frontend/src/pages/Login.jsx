import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      if (!email || !password) return setErrorMsg('Please fill in all fields.');
      try {
        const res = await fetch('/api/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        login(data.user, data.token);
        navigate('/dashboard');
      } catch (err) {
        setErrorMsg(err.message);
      }
    } else {
      if (!email || !password || !username) return setErrorMsg('Please fill in all fields.');
      try {
        const res = await fetch('/api/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        login({ username, email }, 'temp-token-flow'); 
        navigate('/dashboard');
      } catch (err) {
        setErrorMsg(err.message);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div 
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '440px', padding: '40px', borderRadius: '24px', transition: 'transform 0.4s ease' }}
        onMouseEnter={() => setIsLoginHovered(true)}
        onMouseLeave={() => setIsLoginHovered(false)}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)' }}>JobSkillMatcher</h1>
          <p style={{ color: 'var(--text-2)', marginTop: '8px' }}>
            {mode === 'login' ? 'Sign in to your account to continue' : 'Sign up to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-2)', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Username</label>
              <input 
                type="text" 
                value={username} onChange={e => setUsername(e.target.value)}
                style={{ width: '100%', padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text)' }} 
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-2)', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Email Address</label>
            <input 
              type="email" 
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text)' }} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-2)', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Password</label>
            <input 
              type="password" 
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text)' }} 
            />
          </div>

          {errorMsg && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</p>}

          <button 
            type="submit" 
            style={{ 
              width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', 
              color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '16px',
              transition: 'transform 0.2s', transform: isLoginHovered ? 'scale(1.02)' : 'scale(1)',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
          >
            {mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-2)', fontSize: '14px' }}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }} 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
