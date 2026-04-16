import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Chat() {
  const { user, token, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [interviewMode, setInterviewMode] = useState(false);
  const msgEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (user && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Hello! I am your Career Assistant. How can I help you today?' }]);
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleInterviewMode = () => {
    setInterviewMode(!interviewMode);
    setMessages([]);
    const intro = !interviewMode 
      ? 'I am now playing the role of a hiring manager. Please say hello to begin your mock interview.' 
      : 'I am back to normal Career Assistant mode. How can I help you?';
    setMessages([{ role: 'assistant', content: intro }]);
  };

  const handleSend = async () => {
    if (!inputVal.trim()) return;
    const userMsg = inputVal.trim();
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInputVal('');
    setIsTyping(true);

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ messages: newMessages, interviewMode, targetLang: 'en-US' })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply || 'No response.' }]);

      if (interviewMode && 'speechSynthesis' in window) {
        const cleanText = data.reply.replace(/[*_#]/g, '');
        const utter = new SpeechSynthesisUtterance(cleanText);
        window.speechSynthesis.speak(utter);
      }

    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Connection Error.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', padding: '40px 24px', background: 'var(--surface)', borderRight: '1px solid var(--border-glass)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '40px', color: 'var(--text)' }}>🎯 SkillPath</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>Core Platform</p>
          <Link to="/dashboard" style={{ padding: '12px 16px', borderRadius: '12px', color: 'var(--text-2)', textDecoration: 'none', fontWeight: '600' }}>📊 Career Roadmap</Link>
          <Link to="/chat" style={{ padding: '12px 16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>🎙️ AI Mock Interviews</Link>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <header style={{ padding: '24px 40px', background: 'var(--surface)', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '700' }}>Career Assistant</h3>
            <p style={{ color: 'var(--text-3)', fontSize: '13px', fontWeight: '600' }}>Powered by Gemini 2.5 Flash</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={toggleInterviewMode} style={{ padding: '8px 16px', borderRadius: '20px', background: interviewMode ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-2)', border: `1px solid ${interviewMode ? 'var(--accent-3)' : 'var(--border-glass)'}`, color: interviewMode ? 'var(--accent-3)' : 'var(--text-2)', cursor: 'pointer', transition: '0.3s', fontWeight: '600' }}>
              {interviewMode ? '✅ Mock Interview Mode' : 'Mock Interview'}
            </button>
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: m.role === 'user' ? 'var(--surface-2)' : 'linear-gradient(135deg, var(--accent), var(--accent-light))', border: m.role === 'user' ? '1px solid var(--border-glass)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.role === 'user' ? 'var(--text)' : 'white', fontSize: '20px', boxShadow: m.role==='assistant' ? '0 4px 10px rgba(99,102,241,0.2)' : 'none' }}>
                {m.role === 'user' ? user?.[0]?.toUpperCase() : '🤖'}
              </div>
              <div style={{ background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)', color: m.role === 'user' ? 'white' : 'var(--text)', padding: '16px 20px', borderRadius: '16px', borderTopLeftRadius: m.role === 'assistant' ? 0 : '16px', borderTopRightRadius: m.role === 'user' ? 0 : '16px', maxWidth: '75%', lineHeight: '1.6', border: m.role === 'user' ? 'none' : '1px solid var(--border-glass)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && <div style={{ color: 'var(--text-3)', paddingLeft: '56px', fontWeight: '600' }}>AI is typing...</div>}
          <div ref={msgEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '24px 40px', background: 'var(--surface)', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <textarea 
              value={inputVal} onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask me anything..."
              style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '16px', color: 'var(--text)', resize: 'none', minHeight: '60px', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }}
            />
            <button onClick={handleSend} disabled={!inputVal.trim() || isTyping} style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '24px', opacity: (!inputVal.trim() || isTyping) ? 0.5 : 1, boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)', transition: '0.2s' }}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
