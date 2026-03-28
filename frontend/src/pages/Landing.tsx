import React, { useEffect, useRef, useState } from "react";

const COLORS = {
  navy:      "#0A1628",
  navyMid:   "#0F2347",
  teal:      "#00C9A7",
  tealLight: "#E0FDF6",
  gold:      "#F5C842",
  white:     "#FAFBFF",
  offWhite:  "#F0F4FF",
  text:      "#0A1628",
  muted:     "#6B7A99",
  border:    "#DDE3F0",
};

// Inject Google Fonts + global styles
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      background: ${COLORS.white};
      color: ${COLORS.text};
      font-family: 'DM Sans', sans-serif;
      overflow-x: hidden;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50%       { transform: translateY(-18px) rotate(3deg); }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.6; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes breathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.08); opacity: 0.85; }
    }
    .logo-breathe { animation: breathe 3s ease-in-out infinite; }
    .live-badge-pulse { animation: pulse 2s ease-in-out infinite; }
    .hero-badge-breathe { animation: breathe 4s ease-in-out infinite; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-up  { animation: fadeUp 0.7s ease forwards; }
    .animate-fade-in  { animation: fadeIn 0.5s ease forwards; }
    .animate-float    { animation: float 6s ease-in-out infinite; }

    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.25s; }
    .delay-3 { animation-delay: 0.4s; }
    .delay-4 { animation-delay: 0.55s; }
    .delay-5 { animation-delay: 0.7s; }

    .opacity-0 { opacity: 0; }

    .nav-link {
      color: ${COLORS.muted};
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s;
    }
    .nav-link:hover { color: ${COLORS.navy}; }

    .btn-primary {
      background: ${COLORS.teal};
      color: ${COLORS.navy};
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: transform 0.18s, box-shadow 0.18s;
      box-shadow: 0 4px 20px rgba(0,201,167,0.35);
      letter-spacing: 0.01em;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(0,201,167,0.45);
    }

    .btn-ghost {
      background: transparent;
      color: ${COLORS.navy};
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 500;
      padding: 14px 28px;
      border-radius: 10px;
      border: 1.5px solid ${COLORS.border};
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .btn-ghost:hover {
      border-color: ${COLORS.teal};
      background: ${COLORS.tealLight};
    }

    .feature-card {
      background: ${COLORS.white};
      border: 1px solid ${COLORS.border};
      border-radius: 20px;
      padding: 36px 32px;
      transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
      cursor: default;
      position: relative;
      overflow: hidden;
    }
    .feature-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 3px;
      background: linear-gradient(90deg, ${COLORS.teal}, transparent);
      opacity: 0;
      transition: opacity 0.25s;
    }
    .feature-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 50px rgba(10,22,40,0.1);
      border-color: ${COLORS.teal}55;
    }
    .feature-card:hover::before { opacity: 1; }

    .stat-card {
      text-align: center;
      padding: 32px 24px;
    }

    .step-line {
      position: absolute;
      top: 28px;
      left: calc(50% + 28px);
      width: calc(100% - 56px);
      height: 1px;
      background: linear-gradient(90deg, ${COLORS.teal}88, transparent);
    }

    .tag-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: ${COLORS.tealLight};
      color: ${COLORS.teal};
      font-size: 12px;
      font-weight: 600;
      padding: 5px 14px;
      border-radius: 30px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .scroll-reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .scroll-reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `}</style>
);

// Scroll reveal hook
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.15 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Nav ──────────────────────────────────────────────────────────────────────
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 6%',
      height: 68,
      background: scrolled ? 'rgba(250,251,255,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? `1px solid ${COLORS.border}` : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="logo-breathe" style={{
          width: 34, height: 34, borderRadius: 10,
          background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navyMid})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>📋</div>
        <div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: COLORS.navy }}>
            RogNidhi
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.muted, marginLeft: 6 }}>
            रोगनिधि
          </span>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {['Features', 'How it Works', 'For Doctors'].map(l => (
          <a key={l} className="nav-link">{l}</a>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 12 }}>
        <a href="./login">
            <button className="btn-ghost" style={{ padding: '9px 20px', fontSize: 14 }}>Login</button>
        </a>
        <a href="./register">
            <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>Get Started</button>
        </a>
      </div>
    </nav>
  );
};

// ── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => (
  <section style={{
    minHeight: '100vh',
    background: `
      radial-gradient(ellipse 80% 60% at 50% -10%, ${COLORS.teal}18 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 90% 60%, ${COLORS.gold}12 0%, transparent 50%),
      ${COLORS.white}
    `,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '120px 6% 80px',
    position: 'relative', overflow: 'hidden',
    textAlign: 'center',
  }}>
    {/* Decorative blobs */}
    <div className="animate-float" style={{
      position: 'absolute', top: '15%', right: '8%',
      width: 280, height: 280,
      borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
      background: `linear-gradient(135deg, ${COLORS.teal}22, ${COLORS.gold}18)`,
      filter: 'blur(2px)',
      zIndex: 0,
    }} />
    <div className="animate-float delay-3" style={{
      position: 'absolute', bottom: '10%', left: '5%',
      width: 200, height: 200,
      borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
      background: `linear-gradient(135deg, ${COLORS.navyMid}18, ${COLORS.teal}15)`,
      filter: 'blur(2px)',
      zIndex: 0,
    }} />

    {/* Hackathon badge */}
    <div className="animate-fade-up opacity-0" style={{ position: 'relative', zIndex: 1, marginBottom: 24 }}>
      <span className="tag-badge hero-badge-breathe">
        <span>🏆</span> HackMol 7.0 — NIT Jalandhar
      </span>
    </div>

    {/* Headline */}
    <h1 className="animate-fade-up opacity-0 delay-1" style={{
      position: 'relative', zIndex: 1,
      fontFamily: "'Playfair Display', serif",
      fontWeight: 900,
      fontSize: 'clamp(38px, 6.5vw, 74px)',
      lineHeight: 1.08,
      letterSpacing: '-1.5px',
      color: COLORS.navy,
      maxWidth: 840,
      marginBottom: 24,
    }}>
      Your Lifelong<br />
      <span style={{
        background: `linear-gradient(90deg, ${COLORS.teal}, #00a88e)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>Digital Health Treasury</span>
    </h1>

    {/* Subheadline */}
    <p className="animate-fade-up opacity-0 delay-2" style={{
      position: 'relative', zIndex: 1,
      fontSize: 18, fontWeight: 300, color: COLORS.muted,
      maxWidth: 580, lineHeight: 1.7, marginBottom: 44,
    }}>
      RogNidhi unifies your scattered medical records — from handwritten prescriptions to lab PDFs — into one secure, AI-organized health timeline.
    </p>

    {/* CTA row */}
    <div className="animate-fade-up opacity-0 delay-3" style={{
      position: 'relative', zIndex: 1,
      display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64,
    }}>
      <button className="btn-primary">Start for Free →</button>
      <button className="btn-ghost">Doctor Portal</button>
    </div>

    {/* Trust strip */}
    <div className="animate-fade-in opacity-0 delay-5" style={{
      position: 'relative', zIndex: 1,
      display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center',
    }}>
      {[
        { icon: '🔒', label: 'End-to-End Encrypted' },
        { icon: '🤖', label: 'AI-Powered OCR' },
        { icon: '📱', label: 'iOS & Android' },
      ].map(({ icon, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted }}>{label}</span>
        </div>
      ))}
    </div>

    {/* Floating preview card */}
    <div className="animate-fade-up opacity-0 delay-4" style={{
      position: 'relative', zIndex: 1,
      marginTop: 60,
      background: COLORS.white,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 20,
      padding: '20px 28px',
      boxShadow: '0 24px 64px rgba(10,22,40,0.12)',
      maxWidth: 520, width: '100%',
      textAlign: 'left',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${COLORS.teal}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>🩺</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>AI Clinical Summary</div>
          <div style={{ fontSize: 12, color: COLORS.muted }}>Generated for Dr. Sharma · just now</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="live-badge-pulse" style={{ background: `${COLORS.teal}22`, color: COLORS.teal, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>Live</span>
        </div>
      </div>
      {[
        { label: 'Hypertension', since: 'Since 2019', color: COLORS.gold },
        { label: 'CBC Normal', since: 'Mar 2025', color: COLORS.teal },
        { label: 'Metformin 500mg', since: 'Daily', color: '#7C83FD' },
      ].map(({ label, since, color }) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 12px', marginBottom: 6,
          background: COLORS.offWhite, borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
          </div>
          <span style={{ fontSize: 12, color: COLORS.muted }}>{since}</span>
        </div>
      ))}
    </div>
  </section>
);

// ── Stats ─────────────────────────────────────────────────────────────────────
const Stats = () => (
  <section style={{
    background: COLORS.navy,
    padding: '60px 6%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 0,
  }}>
    {[
      { value: '1 Place', label: 'For All Your Records' },
      { value: '< 2 sec', label: 'AI Summary Generation' },
      { value: '100%', label: 'Patient-Controlled Access' },
      { value: '0 Lost', label: 'Medical Documents' },
    ].map(({ value, label }, i) => (
      <div key={label} className="stat-card scroll-reveal" style={{
        borderRight: i < 3 ? `1px solid rgba(255,255,255,0.08)` : 'none',
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 36, fontWeight: 700,
          color: COLORS.teal, marginBottom: 8,
        }}>{value}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>{label}</div>
      </div>
    ))}
  </section>
);

// ── Features ──────────────────────────────────────────────────────────────────
const features = [
  {
    icon: '📂',
    title: 'Unified Health Timeline',
    desc: 'Blood tests, prescriptions, hospital discharge summaries, vaccination records — organized chronologically in one place.',
    detail: 'Supports PDFs, photos, handwritten notes, WhatsApp forwards',
  },
  {
    icon: '🤖',
    title: 'AI-Powered OCR & Extraction',
    desc: 'Our AI reads every format — blurry photocopies, prescription pads, digital lab reports — and extracts structured medical entities.',
    detail: 'Powered by EasyOCR + NLP Named Entity Recognition',
  },
  {
    icon: '⚡',
    title: 'Instant Doctor Summaries',
    desc: 'Before any consultation, share your complete history in one click. Doctors get a structured AI-generated clinical summary.',
    detail: 'LangChain-powered, context-aware summarization',
  },
  {
    icon: '🔒',
    title: 'Secure, Patient-Controlled',
    desc: 'You decide who sees what. Grant and revoke access per doctor, per visit. End-to-end encrypted storage.',
    detail: 'Granular permission controls, full audit log',
  },
  {
    icon: '🏥',
    title: 'Lab & Hospital Integration',
    desc: 'Labs push reports directly to your treasury the moment results are ready. No more chasing reports.',
    detail: 'API-first integration for diagnostic centers',
  },
  {
    icon: '📈',
    title: 'Health Trend Visualization',
    desc: 'Track how your HbA1c, blood pressure, or hemoglobin changes over months and years — presented as easy-to-read charts.',
    detail: 'Auto-extracts values and builds trend graphs',
  },
];

const Features = () => (
  <section style={{ padding: '100px 6%', background: COLORS.offWhite }}>
    <div style={{ textAlign: 'center', marginBottom: 60 }}>
      <div className="tag-badge scroll-reveal" style={{ margin: '0 auto 16px' }}>
        Built for India's Healthcare Reality
      </div>
      <h2 className="scroll-reveal" style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(28px, 4vw, 46px)',
        fontWeight: 700, color: COLORS.navy,
        letterSpacing: '-0.5px', lineHeight: 1.2,
      }}>
        Everything your health history needs
      </h2>
    </div>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 24, maxWidth: 1200, margin: '0 auto',
    }}>
      {features.map(({ icon, title, desc, detail }, i) => (
        <div key={title} className="feature-card scroll-reveal" style={{ animationDelay: `${i * 0.08}s` }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `${COLORS.teal}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 20,
          }}>{icon}</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, marginBottom: 10, color: COLORS.navy }}>{title}</h3>
          <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.65, marginBottom: 14 }}>{desc}</p>
          <div style={{ fontSize: 12, color: COLORS.teal, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 16, height: 1, background: COLORS.teal, display: 'inline-block' }} />
            {detail}
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ── How it Works ─────────────────────────────────────────────────────────────
const steps = [
  { n: '01', icon: '📤', title: 'Upload or Sync', desc: 'Add past reports manually or let labs push directly via API.' },
  { n: '02', icon: '🧠', title: 'AI Organizes', desc: 'OCR extracts data. NLP identifies medical entities. Timeline builds automatically.' },
  { n: '03', icon: '🔐', title: 'Stored Securely', desc: 'Encrypted, lifelong storage with full patient-controlled access.' },
  { n: '04', icon: '🤝', title: 'Share Instantly', desc: 'One tap — your doctor gets a structured summary before your appointment.' },
];

const HowItWorks = () => (
  <section style={{ padding: '100px 6%', background: COLORS.white }}>
    <div style={{ textAlign: 'center', marginBottom: 70 }}>
      <div className="tag-badge scroll-reveal" style={{ margin: '0 auto 16px' }}>Simple Workflow</div>
      <h2 className="scroll-reveal" style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(28px, 4vw, 46px)',
        fontWeight: 700, color: COLORS.navy, letterSpacing: '-0.5px',
      }}>
        From scattered records<br />to organized clarity
      </h2>
    </div>
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 32, maxWidth: 1000, margin: '0 auto',
    }}>
      {steps.map(({ n, icon, title, desc }, i) => (
        <div key={n} className="scroll-reveal" style={{ position: 'relative', textAlign: 'center', padding: '0 16px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: COLORS.navy,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 20px',
            boxShadow: `0 0 0 8px ${COLORS.navy}22`,
            position: 'relative', zIndex: 1,
          }}>
            {icon}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            color: COLORS.teal, marginBottom: 8, textTransform: 'uppercase',
          }}>Step {n}</div>
          <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: COLORS.navy, marginBottom: 10 }}>{title}</h4>
          <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6 }}>{desc}</p>
          {i < steps.length - 1 && (
            <div style={{
              position: 'absolute', top: 30, left: 'calc(50% + 44px)',
              width: 'calc(100% - 88px)', height: 1,
              background: `linear-gradient(90deg, ${COLORS.teal}66, transparent)`,
            }} />
          )}
        </div>
      ))}
    </div>
  </section>
);

// ── Audience Split ────────────────────────────────────────────────────────────
const Audiences = () => (
  <section style={{
    padding: '100px 6%',
    background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`,
  }}>
    <div style={{ textAlign: 'center', marginBottom: 60 }}>
      <h2 className="scroll-reveal" style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(28px, 4vw, 46px)',
        fontWeight: 700, color: COLORS.white, letterSpacing: '-0.5px',
      }}>
        Designed for everyone<br />in your care journey
      </h2>
    </div>
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 24, maxWidth: 1000, margin: '0 auto',
    }}>
      {[
        {
          emoji: '🙋',
          who: 'Patients',
          color: COLORS.teal,
          points: [
            'Never lose a prescription again',
            'See your health trends over time',
            'Share records with any doctor, anywhere',
            'Works even when traveling or changing cities',
          ],
        },
        {
          emoji: '👨‍⚕️',
          who: 'Doctors',
          color: COLORS.gold,
          points: [
            'AI-generated clinical summaries on demand',
            'Query specific details instantly',
            'Complete patient history before consultation',
            'No more starting from scratch',
          ],
        },
        {
          emoji: '🏥',
          who: 'Labs & Hospitals',
          color: '#7C83FD',
          points: [
            'Push reports directly to patient treasury',
            'Instant notifications to patients',
            'Timeline updates automatically',
            'Seamless API-first integration',
          ],
        },
      ].map(({ emoji, who, color, points }) => (
        <div key={who} className="scroll-reveal" style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: 20, padding: '36px 28px',
          transition: 'background 0.2s',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 700,
            color, marginBottom: 20,
          }}>{who}</h3>
          {points.map(p => (
            <div key={p} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
              </div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </section>
);

// ── Tech Stack ────────────────────────────────────────────────────────────────
const TechStack = () => (
  <section style={{ padding: '80px 6%', background: COLORS.offWhite }}>
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <div className="tag-badge scroll-reveal" style={{ margin: '0 auto 14px' }}>Under the Hood</div>
      <h2 className="scroll-reveal" style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(24px, 3vw, 38px)',
        fontWeight: 700, color: COLORS.navy,
      }}>Built with production-grade tech</h2>
    </div>
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 800, margin: '0 auto',
    }}>
      {[
        'React.js', 'TypeScript', 'Flutter', 'Django',
        'MySQL', 'LangChain', 'PyTorch', 'EasyOCR',
        'Tesseract', 'Transformers', 'REST API', 'End-to-End Encryption',
      ].map(tech => (
        <div key={tech} className="scroll-reveal" style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 13, fontWeight: 500, color: COLORS.navy,
        }}>{tech}</div>
      ))}
    </div>
  </section>
);

// ── CTA ───────────────────────────────────────────────────────────────────────
const CTA = () => (
  <section style={{
    padding: '100px 6%',
    background: COLORS.white,
    textAlign: 'center',
  }}>
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`,
      borderRadius: 28,
      padding: '72px 48px',
      maxWidth: 780, margin: '0 auto',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 200, height: 200, borderRadius: '50%',
        background: `${COLORS.teal}22`,
        filter: 'blur(40px)',
      }} />
      <div className="tag-badge scroll-reveal" style={{ margin: '0 auto 20px', background: `${COLORS.teal}33`, color: COLORS.teal }}>
        🚀 HackMol 7.0
      </div>
      <h2 className="scroll-reveal" style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(28px, 4vw, 46px)',
        fontWeight: 700, color: COLORS.white,
        marginBottom: 18, letterSpacing: '-0.5px',
      }}>
        Your health history,<br />finally in one place
      </h2>
      <p className="scroll-reveal" style={{
        fontSize: 16, color: 'rgba(255,255,255,0.6)',
        marginBottom: 40, maxWidth: 460, margin: '0 auto 40px',
      }}>
        Join RogNidhi and experience what it feels like to walk into any doctor's office fully prepared.
      </p>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-primary">Get Started Free</button>
        <button style={{
          background: 'rgba(255,255,255,0.1)',
          color: COLORS.white,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, fontWeight: 500,
          padding: '14px 28px', borderRadius: 10,
          border: '1.5px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
        }}>Watch Demo</button>
      </div>
    </div>
  </section>
);

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{
    padding: '32px 6%',
    background: COLORS.navy,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
    borderTop: `1px solid rgba(255,255,255,0.06)`,
  }}>
    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: COLORS.white }}>
      RogNidhi <span style={{ fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>रोगनिधि</span>
    </div>
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
      Built with ❤️ by <span style={{ color: COLORS.teal, fontWeight: 600 }}>Team TLE</span> · NIT Jalandhar
    </div>
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>HackMol 7.0 · 2025</div>
  </footer>
);

// ── App ───────────────────────────────────────────────────────────────────────
const Landing: React.FC = () => {
  useScrollReveal();

  return (
    <>
      <GlobalStyle />
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Nav />
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Audiences />
        <TechStack />
        <CTA />
        <Footer />
      </div>
    </>
  );
};

export default Landing;