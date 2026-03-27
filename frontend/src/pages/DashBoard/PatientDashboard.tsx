import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Clock, 
  FileUp, 
  Share2, 
  TrendingUp, 
  User, 
  Bell,
  Search,
  Plus,
  FileText,
  ChevronRight
} from "lucide-react";

const COLORS = {
  navy:      "#0A1628",
  teal:      "#00C9A7",
  tealLight: "#E0FDF6",
  white:     "#FAFBFF",
  offWhite:  "#F0F4FF",
  muted:     "#6B7A99",
  border:    "#DDE3F0",
  gold:      "#F5C842",
};

const PatientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <div style={styles.container}>
      <GlobalDashboardStyle />
      
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <div style={styles.logoSquare}>📋</div>
          <span style={styles.logoText}>RogNidhi</span>
        </div>

        <nav style={styles.navStack}>
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <NavItem icon={<Clock size={20}/>} label="Health Timeline" active={activeTab === "timeline"} onClick={() => setActiveTab("timeline")} />
          <NavItem icon={<TrendingUp size={20}/>} label="Vital Trends" active={activeTab === "trends"} onClick={() => setActiveTab("trends")} />
          <NavItem icon={<FileUp size={20}/>} label="Records Treasury" active={activeTab === "records"} onClick={() => setActiveTab("records")} />
          <NavItem icon={<Share2 size={20}/>} label="Access Control" active={activeTab === "access"} onClick={() => setActiveTab("access")} />
        </nav>

        <div style={styles.profileBrief}>
          <div style={styles.avatar}>YP</div>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>Yash Patel</div>
            <div style={styles.profileRole}>Patient ID: #RN2026</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={styles.main}>
        {/* Header Strip */}
        <header style={styles.header}>
          <div style={styles.searchBar}>
            <Search size={18} color={COLORS.muted} />
            <input type="text" placeholder="Search medical records, tests, or doctors..." style={styles.searchInput} />
          </div>
          <div style={styles.headerActions}>
            <button style={styles.iconBtn}><Bell size={20} /></button>
            <button style={styles.uploadBtn}>
              <Plus size={18} /> Upload New Record
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div style={styles.content}>
          <div style={styles.welcomeRow}>
            <h1 style={styles.pageTitle}>Health Timeline</h1>
            <p style={styles.pageSubtitle}>Your lifelong medical journey, organized by RogNidhi AI.</p>
          </div>

          <div style={styles.dashboardGrid}>
            {/* Timeline Column */}
            <section style={styles.timelineSection}>
              <TimelineItem 
                date="Mar 24, 2026" 
                type="Pathology" 
                title="Complete Blood Count (CBC)" 
                location="City Diagnostic Center" 
                status="Normal"
                color={COLORS.teal}
              />
              <TimelineItem 
                date="Jan 12, 2026" 
                type="Prescription" 
                title="General Consultation - Seasonal Flu" 
                location="Dr. Sharma's Clinic" 
                status="Completed"
                color={COLORS.gold}
              />
              <TimelineItem 
                date="Dec 20, 2025" 
                type="Vaccination" 
                title="Covid-19 Booster Dose" 
                location="Apollo Hospitals" 
                status="Verified"
                color="#7C83FD"
              />
            </section>

            {/* Quick Stats & Trends */}
            <aside style={styles.statsSidebar}>
              <div style={styles.statCard}>
                <h3 style={styles.cardHeading}>AI Insights</h3>
                <div style={styles.insightBox}>
                  <div style={{color: COLORS.teal, fontWeight: 600, fontSize: 13}}>HbA1c Trend</div>
                  <div style={{fontSize: 12, color: COLORS.muted}}>Your sugar levels have decreased by 0.4% since last test.</div>
                </div>
              </div>

              <div style={styles.statCard}>
                <h3 style={styles.cardHeading}>Active Access</h3>
                <p style={{fontSize: 13, color: COLORS.muted, marginBottom: 15}}>2 doctors currently have access to your treasury.</p>
                <button style={styles.manageBtn}>Manage Permissions</button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

/* --- Sub-Components --- */

const NavItem = ({ icon, label, active, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`nav-item ${active ? 'active' : ''}`}
    style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
      color: active ? COLORS.teal : COLORS.muted,
      background: active ? `${COLORS.teal}10` : 'transparent',
      fontWeight: active ? 600 : 500,
      fontSize: 14
    }}
  >
    {icon} {label}
  </div>
);

const TimelineItem = ({ date, type, title, location, status, color }: any) => (
  <div style={styles.timelineCard} className="scroll-reveal">
    <div style={{...styles.timelineDot, background: color}} />
    <div style={styles.timelineContent}>
      <div style={styles.timelineHeader}>
        <span style={styles.timelineDate}>{date}</span>
        <span style={{...styles.typeTag, color: color, background: `${color}15`}}>{type}</span>
      </div>
      <h4 style={styles.timelineTitle}>{title}</h4>
      <div style={styles.timelineFooter}>
        <span style={styles.location}><FileText size={14} /> {location}</span>
        <span style={styles.status}><ChevronRight size={16} /> View Report</span>
      </div>
    </div>
  </div>
);

const GlobalDashboardStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
    
    .nav-item:hover { background: ${COLORS.offWhite} !important; color: ${COLORS.navy} !important; }
    .nav-item.active:hover { background: ${COLORS.teal}15 !important; }
    
    .scroll-reveal {
      animation: reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes reveal {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex', minHeight: '100vh', backgroundColor: COLORS.white,
    fontFamily: "'Outfit', sans-serif", color: COLORS.navy
  },
  sidebar: {
    width: 280, backgroundColor: COLORS.white, borderRight: `1px solid ${COLORS.border}`,
    display: 'flex', flexDirection: 'column', padding: '32px 24px', position: 'fixed', height: '100vh'
  },
  logoSection: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 },
  logoSquare: { 
    width: 36, height: 36, background: COLORS.navy, borderRadius: 10, 
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.white, fontSize: 18
  },
  logoText: { fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' },
  navStack: { display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 },
  profileBrief: { 
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px', 
    background: COLORS.offWhite, borderRadius: 16 
  },
  avatar: { 
    width: 40, height: 40, borderRadius: 12, background: COLORS.teal, 
    color: COLORS.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
  },
  profileName: { fontSize: 14, fontWeight: 600 },
  profileRole: { fontSize: 11, color: COLORS.muted },
  
  main: { flexGrow: 1, marginLeft: 280, display: 'flex', flexDirection: 'column' },
  header: { 
    height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 40px', borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, 
    backgroundColor: 'rgba(250,251,255,0.8)', backdropFilter: 'blur(10px)', zIndex: 10
  },
  searchBar: { 
    display: 'flex', alignItems: 'center', gap: 10, background: COLORS.offWhite,
    padding: '10px 16px', borderRadius: 12, width: 400
  },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 14, width: '100%' },
  uploadBtn: { 
    background: COLORS.teal, color: COLORS.navy, border: 'none', padding: '10px 20px',
    borderRadius: 10, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
  },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted },

  content: { padding: '40px' },
  welcomeRow: { marginBottom: 32 },
  pageTitle: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: COLORS.muted },
  
  dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 },
  timelineSection: { display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' },
  
  timelineCard: { 
    background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 20,
    padding: '24px', display: 'flex', gap: 20, position: 'relative'
  },
  timelineDot: { 
    width: 12, height: 12, borderRadius: '50%', marginTop: 6, flexShrink: 0,
    boxShadow: '0 0 0 4px #FFFFFF, 0 0 0 5px #DDE3F0'
  },
  timelineHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  timelineDate: { fontSize: 12, fontWeight: 600, color: COLORS.muted },
  typeTag: { fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' },
  timelineTitle: { fontSize: 17, fontWeight: 600, marginBottom: 16 },
  timelineFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  location: { fontSize: 13, color: COLORS.muted, display: 'flex', alignItems: 'center', gap: 6 },
  status: { fontSize: 13, color: COLORS.teal, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' },

  statsSidebar: { display: 'flex', flexDirection: 'column', gap: 24 },
  statCard: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: '24px' },
  cardHeading: { fontSize: 15, fontWeight: 700, marginBottom: 16 },
  insightBox: { background: COLORS.tealLight, padding: '16px', borderRadius: 12 },
  manageBtn: { 
    width: '100%', background: COLORS.navy, color: COLORS.white, border: 'none',
    padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer'
  }
};

export default PatientDashboard;