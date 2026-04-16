import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yHeroText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg)' }} ref={ref}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '20px 40px', display: 'flex', justifyContent: 'space-between',
        background: 'rgba(248, 250, 252, 0.7)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.5)'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text)' }}>JobSkillMatcher</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-3)', fontWeight: '600' }}>Home</Link>
          <Link to="/login" style={{ padding: '8px 24px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'white', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)' }}>Login</Link>
        </div>
      </nav>

      <div style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <motion.div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, y: yBackground,
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15), transparent 40%), radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.15), transparent 40%)'
        }} />

        <motion.div style={{ y: yHeroText, opacity: opacityHeroText, textAlign: 'center', zIndex: 10 }}>
          <h1 style={{ fontSize: '72px', letterSpacing: '-0.03em', marginBottom: '20px', color: 'var(--text)' }}>
            Your Career <span style={{ color: 'var(--accent)' }}>Blueprint</span>
          </h1>
          <p style={{ fontSize: '24px', color: 'var(--text-2)', maxWidth: '600px', margin: '0 auto', marginBottom: '40px' }}>
            Everything you need to go from "I have no idea" to "I got the job" — in one place.
          </p>
          <Link to="/login" style={{ padding: '16px 32px', fontSize: '18px', borderRadius: '30px', background: 'var(--text)', color: 'var(--bg)', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>Get Started Free</Link>
        </motion.div>
      </div>

      <div style={{ padding: '100px 40px', background: 'var(--bg)', position: 'relative', zIndex: 20 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '40px', color: 'var(--text)' }}>Core Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {[ { icon: '🎯', title: 'AI Skill Assessment', desc: 'AI maps your answers to real job roles instantly.' },
               { icon: '🔗', title: 'Job Matcher', desc: 'See which jobs match your current skills with salary data.' },
               { icon: '📊', title: 'Skill Gap Analysis', desc: 'Shows exactly which skills you are missing.' }
            ].map((f, i) => (
              <motion.div key={i} whileHover={{ y: -10, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }} className="glass-panel" style={{ padding: '40px', borderRadius: '20px' }}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
