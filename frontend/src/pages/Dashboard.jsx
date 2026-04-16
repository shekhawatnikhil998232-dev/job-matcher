import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function Dashboard() {
  const { user, token, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [fetching, setFetching] = useState(true);
  
  const [targetRole, setTargetRole] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (token) fetchRoadmap();
  }, [user, token, loading, navigate]);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch('/api/roadmap', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.roadmap) setRoadmap(data.roadmap);
    } catch (err) { } finally { setFetching(false); }
  };

  const generateRoadmap = async () => {
    if (!skillsInput.trim()) return setGenerateError("Please enter some skills first!");
    setIsGenerating(true); setGenerateError('');
    try {
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: targetRole || "Software Engineer", skills: skillsInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRoadmap(data.roadmap);
    } catch (err) { setGenerateError(err.message); } finally { setIsGenerating(false); }
  };

  if (loading || fetching) return <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '40px' }}>Loading...</div>;

  const baseScore = roadmap?.skills_acquired?.length ? Math.min(30 + (roadmap.skills_acquired.length * 10), 90) : 30;
  const radarData = {
    labels: ['Architecture', 'Frontend', 'Backend', 'Databases', 'Algorithms', 'DevOps'],
    datasets: [
      {
        label: 'Your Current DNA',
        data: [baseScore-10, baseScore+5, baseScore, baseScore-5, baseScore+10, baseScore-20],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#fff',
        borderWidth: 2,
      },
      {
        label: `Target ${roadmap?.target_role || 'Role'}`,
        data: [95, 90, 95, 85, 90, 80],
        backgroundColor: 'rgba(14, 165, 233, 0.05)',
        borderColor: '#0ea5e9',
        borderDash: [5, 5],
        borderWidth: 2,
      }
    ]
  };

  const radarOptions = {
    scales: { r: { grid: { color: 'rgba(0,0,0,0.1)' }, angleLines: { color: 'rgba(0,0,0,0.1)' }, pointLabels: { color: '#334155' }, ticks: { display: false, min: 0, max: 100 } } },
    plugins: { legend: { labels: { color: '#0f172a' } } }
  };

  const toggleState = async (index) => {
    const newMissing = [...roadmap.skills_missing];
    newMissing[index].completed = !newMissing[index].completed;
    const newRoadmap = { ...roadmap, skills_missing: newMissing };
    setRoadmap(newRoadmap);

    try {
      await fetch('/api/roadmap/update', {
        method: "POST", headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills_missing: newMissing })
      });
    } catch(err) {}
  };

  const progressPercent = roadmap?.skills_missing?.length ? 
    Math.round((roadmap.skills_missing.filter(s => s.completed).length / roadmap.skills_missing.length) * 100) : 100;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      
      <aside style={{ width: '280px', padding: '40px 24px', background: 'var(--surface)', borderRight: '1px solid var(--border-glass)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '40px', color: 'var(--text)' }}>🎯 SkillPath</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>Core Platform</p>
          <Link to="/dashboard" style={{ padding: '12px 16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>📊 Career Roadmap</Link>
          <Link to="/chat" style={{ padding: '12px 16px', borderRadius: '12px', color: 'var(--text-2)', textDecoration: 'none', fontWeight: '600' }}>🎙️ AI Mock Interviews</Link>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '60px', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ color: 'var(--text-2)', fontSize: '18px', marginBottom: '8px' }}>Welcome back, {user} 👋</p>
        <h1 style={{ fontSize: '36px', color: 'var(--text)', marginBottom: '40px' }}>Career Roadmap</h1>

        {!roadmap ? (
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', maxWidth: '600px' }}>
            <h3 style={{ color: 'var(--text)', fontSize: '20px', marginBottom: '24px' }}>Let's build your path</h3>
            
            <label style={{ display: 'block', color: 'var(--text-2)', marginBottom: '8px', fontWeight: '600' }}>What is your target role?</label>
            <input type="text" placeholder="e.g. Fullstack Developer" value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{ width: '100%', padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text)', marginBottom: '20px' }} />

            <label style={{ display: 'block', color: 'var(--text-2)', marginBottom: '8px', fontWeight: '600' }}>What skills do you currently have?</label>
            <textarea placeholder="e.g. HTML, base Python, React basics..." value={skillsInput} onChange={e => setSkillsInput(e.target.value)} rows={3} style={{ width: '100%', padding: '14px', background: 'var(--surface-2)', border: '1px solid var(--border-glass)', borderRadius: '12px', color: 'var(--text)', marginBottom: '20px' }} />

            {generateError && <p style={{ color: '#ef4444', marginBottom: '16px' }}>{generateError}</p>}
            
            <button disabled={isGenerating} onClick={generateRoadmap} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'white', fontWeight: 'bold', border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
              {isGenerating ? 'Generating AI Roadmap...' : 'Generate AI Roadmap ✨'}
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '24px', color: 'var(--text)', marginBottom: '20px' }}>Roadmap to {roadmap.target_role}</h3>
            
            <div style={{ height: '24px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', border: '1px solid var(--border-glass)' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', transition: 'width 0.5s' }} />
            </div>
            <p style={{ color: 'var(--text-2)', textAlign: 'right', marginBottom: '40px', fontWeight: '600' }}>{progressPercent}% Ready</p>

            <div style={{ display: 'flex', gap: '40px' }}>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ color: 'var(--text)', marginBottom: '16px' }}>Skills to Learn 🚀</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {roadmap.skills_missing?.map((item, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleState(i)}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: item.completed ? 'none' : '2px solid rgba(0,0,0,0.2)', background: item.completed ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                          {item.completed && '✓'}
                        </div>
                        <span style={{ color: item.completed ? 'var(--text-3)' : 'var(--text)', textDecoration: item.completed ? 'line-through' : 'none', fontWeight: '600' }}>{item.skill}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', width: '100%' }}>
                  <h4 style={{ color: 'var(--text)', marginBottom: '16px', textAlign: 'center' }}>AI Skill Radar</h4>
                  <Radar data={radarData} options={radarOptions} />
                </div>
              </div>
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
