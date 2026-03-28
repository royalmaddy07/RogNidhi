import React, { useEffect, useState } from "react";
import { Users, Search, FileText, Clock, CheckCircle } from "lucide-react";

const COLORS = {
  navy: "#0A1628",
  teal: "#00C9A7",
  white: "#FAFBFF",
  offWhite: "#F0F4FF",
  muted: "#6B7A99",
  border: "#DDE3F0",
};

const DoctorDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  if (!user) return null;

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <div style={styles.logoSquare}>📋</div>
          <span style={styles.logoText}>RogNidhi</span>
        </div>
        <nav style={styles.navStack}>
          <div style={styles.navItemActive}><Users size={18} /> Patient Queue</div>
          <div style={styles.navItem}><FileText size={18} /> AI Summaries [cite: 38, 66, 145]</div>
          <div style={styles.navItem}><Clock size={18} /> Recent Reviews</div>
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.searchBar}>
            <Search size={18} color={COLORS.muted} />
            <input type="text" placeholder="Find patient..." style={styles.searchInput} />
          </div>
          <div style={styles.avatar}>{user.name.charAt(0)}</div>
        </header>

        <div style={{ padding: '40px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Clinical Overview</h1>
          <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 4 }}>Analyze AI clinical summaries. [cite: 68]</p>
          
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span>Patient Name</span>
              <span>Status</span>
              <span>AI Summary</span>
            </div>
            <div style={styles.tableRow}>
              <span>Yash Patel</span>
              <span style={{ color: COLORS.teal }}><CheckCircle size={14} /> Access Granted [cite: 36]</span>
              <button style={styles.summaryBtn}>View AI Summary [cite: 38]</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: COLORS.white, fontFamily: 'Outfit, sans-serif' },
  sidebar: { width: 260, borderRight: `1px solid ${COLORS.border}`, padding: '30px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' },
  logoSection: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 },
  logoSquare: { width: 34, height: 34, background: COLORS.navy, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  logoText: { fontSize: 20, fontWeight: 700 },
  navStack: { display: 'flex', flexDirection: 'column', gap: 8, flexGrow: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, fontSize: 14, color: COLORS.muted },
  navItemActive: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, fontSize: 14, background: `${COLORS.teal}15`, color: COLORS.teal, fontWeight: 600 },
  main: { flexGrow: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' },
  header: { height: 80, padding: '0 40px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  searchBar: { display: 'flex', alignItems: 'center', gap: 10, background: COLORS.offWhite, padding: '10px 16px', borderRadius: 10, width: 350 },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 14, width: '100%' },
  avatar: { width: 36, height: 36, borderRadius: 10, background: COLORS.teal, color: COLORS.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  table: { marginTop: 30, border: `1px solid ${COLORS.border}`, borderRadius: 18, overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1fr 1fr 150px', padding: '16px 24px', background: COLORS.offWhite, fontSize: 13, fontWeight: 600 },
  tableRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 150px', padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`, alignItems: 'center' },
  summaryBtn: { border: `1px solid ${COLORS.teal}`, background: 'transparent', color: COLORS.teal, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }
};

export default DoctorDashboard;