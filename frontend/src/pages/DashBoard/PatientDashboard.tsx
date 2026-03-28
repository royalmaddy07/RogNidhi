import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, FileUp, Share2, TrendingUp, Bell, 
  Search, Plus, ChevronRight, Activity, 
  ShieldCheck, CreditCard, Loader2, CheckCircle2, AlertCircle,
  FileText, Trash2
} from "lucide-react";
import Sidebar from '../../components/Sidebar';

const COLORS = {
  navy: "#0A1628",
  navyMid: "#112240",
  teal: "#00C9A7",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  muted: "#64748B",
  border: "#E2E8F0",
  tealLight: "#E0FDF6",
  error: "#EF4444", // Added error color
};

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]); 
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await fetch("http://127.0.0.1:8000/api/records/timeline/", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch medical timeline");
    }
  };

  // ─── DELETE LOGIC ───────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const token = localStorage.getItem("access");
      const response = await fetch(`http://127.0.0.1:8000/api/documents/delete/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setUploadStatus({ type: 'success', msg: "Record removed successfully." });
        fetchRecords(); // Refresh list
      } else {
        setUploadStatus({ type: 'error', msg: "Failed to delete record." });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', msg: "Server connection failed." });
    }
    setTimeout(() => setUploadStatus(null), 3000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchRecords(); 
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name.split('.')[0]); 
    formData.append("document_type", "other");

    try {
      const token = localStorage.getItem("access");
      const response = await fetch("http://127.0.0.1:8000/api/documents/upload/", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus({ type: 'success', msg: "Report added to treasury!" });
        fetchRecords(); 
      } else {
        const errData = await response.json();
        const errMsg = errData.detail || errData.file?.[0] || errData.error || "Upload failed.";
        setUploadStatus({ type: 'error', msg: errMsg });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', msg: "Server connection failed." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        .nav-item { transition: all 0.2s ease; cursor: pointer; display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-radius: 14px; }
        .nav-item:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .record-card { transition: all 0.3s ease; cursor: pointer; position: relative; }
        .record-card:hover { transform: translateY(-2px); box-shadow: 0 12px 20px rgba(0,0,0,0.05); border-color: ${COLORS.teal} !important; }
        .logout-btn { transition: all 0.2s ease; }
        .logout-btn:hover { background: #fee2e2 !important; color: #ef4444 !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .delete-icon { 
          padding: 8px; 
          border-radius: 8px; 
          color: ${COLORS.muted}; 
          transition: all 0.2s;
        }
        .delete-icon:hover { 
          background-color: #FEE2E2; 
          color: ${COLORS.error}; 
        }
      `}</style>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />

      <Sidebar user={user} />

      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.searchBar}>
            <Search size={18} color={COLORS.muted} />
            <input type="text" placeholder="Search medical history..." style={styles.searchInput} />
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={styles.iconCircle}><Bell size={20} color={COLORS.muted} /></div>
            <button 
              style={{...styles.uploadBtn, opacity: isUploading ? 0.7 : 1}} 
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {isUploading ? "Uploading..." : "Upload Record"}
            </button>
          </div>
        </header>

        {uploadStatus && (
          <div style={{
            position: 'absolute', top: 100, right: 40, zIndex: 1000,
            background: uploadStatus.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${uploadStatus.type === 'success' ? '#10B981' : '#EF4444'}`,
            padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            {uploadStatus.type === 'success' ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#EF4444" />}
            <span style={{ fontSize: '14px', fontWeight: 600, color: uploadStatus.type === 'success' ? '#065F46' : '#991B1B' }}>
              {uploadStatus.msg}
            </span>
          </div>
        )}

        <div style={styles.contentArea}>
          <div style={styles.heroSection}>
            <div>
              <h1 style={styles.pageTitle}>Welcome back, {user.name.split(' ')[0]}</h1>
              <p style={styles.pageSubtitle}>Your lifelong health records, protected and organized.</p>
            </div>
            <div style={styles.healthScoreCard}>
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.teal, letterSpacing: '0.05em' }}>HEALTH SCORE</span>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy }}>84<span style={{fontSize: 14, color: COLORS.muted}}>/100</span></div>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.mainCol}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={styles.sectionHeading}>Your Medical Timeline</h3>
                <span onClick={fetchRecords} style={{ fontSize: 13, color: COLORS.teal, fontWeight: 700, cursor: 'pointer' }}>Refresh</span>
              </div>
              
              {records.length > 0 ? (
                records.map((rec) => (
                  <RecordCard 
                    key={rec.id}
                    id={rec.id}
                    date={`${rec.date} ${rec.year}`} 
                    title={rec.title} 
                    lab={rec.type} 
                    type={rec.type}
                    url={rec.file_url}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '24px', border: `1px dashed ${COLORS.border}` }}>
                  <FileText size={40} color={COLORS.border} style={{ marginBottom: '16px' }} />
                  <p style={{ color: COLORS.muted }}>No records in your treasury yet.</p>
                </div>
              )}
            </div>

            <div style={styles.sideCol}>
              <div style={styles.glassCard}>
                <h4 style={styles.cardHeading}>AI Health Insight</h4>
                <div style={styles.insightBox}>
                  <Activity size={20} color={COLORS.teal} style={{marginTop: '2px'}} />
                  <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: COLORS.navy }}>
                    Your health treasury is growing. Add more reports to unlock trend analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const RecordCard = ({ id, date, title, lab, type, url, onDelete }: any) => (
  <div className="record-card" onClick={() => window.open(url, '_blank')} style={styles.card}>
    <div style={styles.dateBox}>
      <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy, lineHeight: 1 }}>{date.split(' ')[0]}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', marginTop: '4px' }}>{date.split(' ')[1]}</div>
    </div>
    <div style={styles.cardDivider} />
    <div style={{ flexGrow: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.navy }}>{title}</div>
          <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{lab}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={styles.typeBadge}>{type}</span>
          {/* TRASH CAN ICON ADDED HERE */}
          <div 
            className="delete-icon" 
            onClick={(e) => {
              e.stopPropagation(); // Stop from opening the URL
              onDelete(id);
            }}
          >
            <Trash2 size={18} />
          </div>
        </div>
      </div>
    </div>
    <div style={styles.arrowCircle}><ChevronRight size={18} color={COLORS.muted} /></div>
  </div>
);

const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: "#F8FAFC" },
  sidebar: { width: 280, background: `linear-gradient(180deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`, padding: '40px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', color: '#fff', zIndex: 100 },
  logoSection: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, paddingLeft: 10 },
  logoSquare: { width: 40, height: 40, background: 'rgba(255,255,255,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  logoText: { fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' },
  navStack: { display: 'flex', flexDirection: 'column', gap: 8, flexGrow: 1 },
  navItem: { color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: 15 },
  navItemActive: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, fontSize: 15, background: COLORS.teal, color: COLORS.navy, fontWeight: 700, boxShadow: `0 10px 20px rgba(0, 201, 167, 0.2)` },
  sidebarFooter: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 },
  profileBrief: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' },
  avatar: { width: 40, height: 40, borderRadius: 10, background: COLORS.teal, color: COLORS.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 },
  profileInfo: { overflow: 'hidden' },
  profileName: { fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  profileRole: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  main: { flexGrow: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minWidth: 0 },
  header: { height: 80, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 90, borderBottom: `1px solid ${COLORS.border}` },
  searchBar: { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '10px 18px', borderRadius: 14, width: 380, border: `1px solid ${COLORS.border}` },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontWeight: 500, width: '100%' },
  uploadBtn: { background: COLORS.teal, color: COLORS.navy, border: 'none', padding: '10px 22px', borderRadius: 12, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,201,167,0.2)' },
  iconCircle: { width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${COLORS.border}`, cursor: 'pointer' },
  contentArea: { padding: '40px', maxWidth: '1200px', width: '100%', margin: '0 auto' },
  heroSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 },
  pageTitle: { fontSize: 32, fontWeight: 800, color: COLORS.navy, letterSpacing: '-0.8px', margin: 0 },
  pageSubtitle: { color: COLORS.muted, fontSize: 16, marginTop: 8, fontWeight: 400 },
  healthScoreCard: { background: '#fff', padding: '16px 24px', borderRadius: 20, border: `1px solid ${COLORS.border}`, textAlign: 'right', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 },
  sectionHeading: { fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 },
  mainCol: { display: 'flex', flexDirection: 'column' },
  card: { background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: '20px', display: 'flex', alignItems: 'center', marginBottom: 16 },
  dateBox: { textAlign: 'center', minWidth: 50 },
  cardDivider: { width: 1, height: 32, background: COLORS.border, margin: '0 20px' },
  typeBadge: { fontSize: 10, fontWeight: 800, background: COLORS.offWhite, color: COLORS.muted, padding: '5px 12px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.4px' },
  arrowCircle: { width: 32, height: 32, borderRadius: '50%', background: COLORS.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  sideCol: { display: 'flex', flexDirection: 'column' },
  glassCard: { background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
  cardHeading: { fontSize: 15, fontWeight: 700, color: COLORS.navy, marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.5px' },
  insightBox: { background: COLORS.tealLight, padding: '16px', borderRadius: 16, display: 'flex', gap: 12, alignItems: 'flex-start' },
  actionBtn: { width: '100%', background: COLORS.navy, color: '#fff', border: 'none', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }
};

export default PatientDashboard;