import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── CONSTANTS ────────────────────────────────────────────────
const COLORS = {
  navy:     "#0A1628",
  navyMid:  "#0F2347",
  teal:     "#00C9A7",
  gold:     "#F5C842",
  white:    "#FAFBFF",
  offWhite: "#F0F4FF",
  text:     "#0A1628",
  muted:    "#6B7A99",
  border:   "#DDE3F0",
  sidebar:  "#060E1C",
};

const ACTION_META: Record<string, { label: string; icon: string; color: string }> = {
  document_viewed:    { label: "Viewed document",     icon: "◉", color: "#2B6CB0" },
  document_uploaded:  { label: "Uploaded document",   icon: "◈", color: "#276749" },
  access_granted:     { label: "Access granted",      icon: "◎", color: "#00C9A7" },
  access_revoked:     { label: "Access revoked",      icon: "◫", color: "#C53030" },
  summary_generated:  { label: "Generated summary",   icon: "◧", color: "#6B46C1" },
  profile_updated:    { label: "Profile updated",     icon: "◐", color: "#B7791F" },
};

// ─── TYPES ────────────────────────────────────────────────────
interface AuditEntry {
  action:       string;
  target_table: string;
  target_id:    number;
  performed_at: string;
}

interface DoctorUser {
  id:    number;
  name:  string;
  email: string;
  role:  string;
  profile: {
    specialization?: string | null;
    hospital?:       string | null;
    license_number?: string | null;
  };
  stats: {
    total_patients:       number;
    unread_notifications: number;
  };
  recent_activity: AuditEntry[];
}

// ─── STYLES ───────────────────────────────────────────────────
const DoctorDashStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #F4F6FB; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes expandWidth {
      from { width: 0; }
      to   { width: var(--target-w); }
    }

    .fade-up-1 { animation: fadeInUp 0.5s 0.05s ease both; }
    .fade-up-2 { animation: fadeInUp 0.5s 0.10s ease both; }
    .fade-up-3 { animation: fadeInUp 0.5s 0.15s ease both; }
    .fade-up-4 { animation: fadeInUp 0.5s 0.20s ease both; }
    .fade-up-5 { animation: fadeInUp 0.5s 0.25s ease both; }

    .sidebar {
      position: fixed; top: 0; left: 0;
      width: 240px; height: 100vh;
      background: ${COLORS.sidebar};
      display: flex; flex-direction: column;
      padding: 32px 0; z-index: 100;
      border-right: 1px solid rgba(255,255,255,0.05);
    }

    .sidebar-logo {
      padding: 0 24px 32px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .sidebar-nav { flex: 1; padding: 24px 0; }

    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 24px; font-size: 14px; font-weight: 500;
      color: rgba(255,255,255,0.4); cursor: pointer;
      transition: all 0.2s; border-left: 3px solid transparent;
    }

    .nav-item:hover  { color: ${COLORS.white}; background: rgba(255,255,255,0.04); }
    .nav-item.active {
      color: ${COLORS.gold}; border-left-color: ${COLORS.gold};
      background: rgba(245,200,66,0.06);
    }

    .nav-icon { font-size: 15px; width: 20px; text-align: center; }

    .notif-badge {
      background: #E53E3E; color: white;
      font-size: 11px; font-weight: 700;
      padding: 2px 7px; border-radius: 20px;
      margin-left: auto;
    }

    .sidebar-footer {
      padding: 20px 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .main-content {
      margin-left: 240px;
      min-height: 100vh;
      padding: 40px 40px 60px;
      background: #F4F6FB;
    }

    .stat-card {
      background: ${COLORS.white};
      border: 1px solid ${COLORS.border};
      border-radius: 16px;
      padding: 24px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(10,22,40,0.08);
    }

    .section-card {
      background: ${COLORS.white};
      border: 1px solid ${COLORS.border};
      border-radius: 20px;
      padding: 28px;
    }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px; color: ${COLORS.navy};
      margin-bottom: 20px;
      display: flex; align-items: center; gap: 10px;
    }

    .search-bar {
      width: 100%; padding: 14px 18px;
      border-radius: 12px;
      border: 1.5px solid ${COLORS.border};
      background: ${COLORS.white};
      font-family: 'DM Sans', sans-serif;
      font-size: 14px; outline: none;
      transition: all 0.2s; color: ${COLORS.text};
    }

    .search-bar:focus {
      border-color: ${COLORS.gold};
      box-shadow: 0 0 0 4px ${COLORS.gold}18;
    }

    .search-btn {
      padding: 14px 24px;
      background: ${COLORS.navy}; color: ${COLORS.white};
      font-family: 'DM Sans', sans-serif;
      font-size: 14px; font-weight: 600;
      border: none; border-radius: 12px;
      cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
    }

    .search-btn:hover {
      background: ${COLORS.navyMid};
      transform: translateY(-1px);
    }

    .activity-row {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 14px 0;
      border-bottom: 1px solid ${COLORS.border};
    }

    .activity-row:last-child { border-bottom: none; }

    .activity-icon {
      width: 34px; height: 34px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; flex-shrink: 0; margin-top: 2px;
    }

    .logout-btn {
      width: 100%; padding: 10px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: rgba(255,255,255,0.5);
      font-size: 13px; font-weight: 500;
      cursor: pointer; display: flex;
      align-items: center; gap: 8px;
      transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
    }

    .logout-btn:hover {
      background: rgba(229,62,62,0.12);
      border-color: rgba(229,62,62,0.25);
      color: #FEB2B2;
    }

    .empty-state {
      text-align: center; padding: 40px 0;
      color: ${COLORS.muted}; font-size: 14px;
    }

    .profile-chip {
      display: inline-flex; align-items: center; gap: 6px;
      background: ${COLORS.offWhite};
      border: 1px solid ${COLORS.border};
      border-radius: 20px; padding: 6px 14px;
      font-size: 12px; font-weight: 500;
      color: ${COLORS.muted};
    }

    .ai-summary-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, ${COLORS.teal}, #00A896);
      color: ${COLORS.navy}; border: none; border-radius: 10px;
      padding: 10px 18px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      font-family: 'DM Sans', sans-serif;
      box-shadow: 0 4px 14px rgba(0,201,167,0.25);
    }

    .ai-summary-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0,201,167,0.35);
    }
  `}</style>
);

// ─── HELPERS ──────────────────────────────────────────────────
const formatDateTime = (isoStr: string) => {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  }) + " · " + d.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const timeAgo = (isoStr: string): string => {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
};

// ─── COMPONENT ────────────────────────────────────────────────
const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser]             = useState<DoctorUser | null>(null);
  const [activeNav, setActiveNav]   = useState("dashboard");
  const [searchQuery, setSearch]    = useState("");
  const [searching, setSearching]   = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored) as DoctorUser;
    if (parsed.role !== "doctor") { navigate("/login"); return; }
    setUser(parsed);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Patient search — will call the search API (placeholder for now)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    // TODO: call GET /api/share/my-patients/?search=query
    setTimeout(() => setSearching(false), 800);
  };

  if (!user) return null;

  const { profile, stats, recent_activity } = user;

  const navItems = [
    { key: "dashboard", icon: "◈", label: "Dashboard" },
    { key: "patients",  icon: "◧", label: "My Patients" },
    { key: "notifs",    icon: "◉", label: "Notifications", badge: stats.unread_notifications },
    { key: "activity",  icon: "◎", label: "Activity Log" },
  ];

  return (
    <>
      <DoctorDashStyle />

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.navyMid})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}>📋</div>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 16, color: COLORS.white, fontWeight: 700,
            }}>RogNidhi</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activeNav === item.key ? "active" : ""}`}
              onClick={() => setActiveNav(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge ? (
                <span className="notif-badge">{item.badge}</span>
              ) : null}
            </div>
          ))}
        </nav>

        {/* Doctor info + logout */}
        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.gold}80, ${COLORS.navyMid})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: COLORS.navy, flexShrink: 0,
            }}>
              {getInitials(user.name)}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{
                fontSize: 13, fontWeight: 600, color: COLORS.white,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {user.name}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {profile.specialization ?? "Doctor"}
              </p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>↩</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">

        {/* ── Header ── */}
        <div className="fade-up-1" style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 4 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32, color: COLORS.navy, fontWeight: 700,
          }}>
            {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening"},{" "}
            <span style={{ color: COLORS.gold }}>{user.name.replace(/^Dr\.?\s*/i, "Dr. ")}</span>
          </h1>

          {/* Doctor chips */}
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            {profile.specialization && (
              <span className="profile-chip">◈ {profile.specialization}</span>
            )}
            {profile.hospital && (
              <span className="profile-chip">◧ {profile.hospital}</span>
            )}
            {profile.license_number && (
              <span className="profile-chip">◉ {profile.license_number}</span>
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="fade-up-2" style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20, marginBottom: 32,
        }}>
          {/* Active Patients */}
          <div className="stat-card" style={{
            background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyMid})`,
            border: "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500, marginBottom: 8 }}>
                  Active Patients
                </p>
                <p style={{
                  fontSize: 48, fontWeight: 700, color: COLORS.white,
                  fontFamily: "'Playfair Display', serif", lineHeight: 1,
                }}>
                  {stats.total_patients}
                </p>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>👥</div>
            </div>
            <p style={{ fontSize: 12, color: COLORS.teal, marginTop: 14, fontWeight: 500 }}>
              Shared their records with you
            </p>
          </div>

          {/* Notifications */}
          <div className="stat-card" style={{
            borderColor: stats.unread_notifications > 0 ? "#FEB2B2" : COLORS.border,
            background: stats.unread_notifications > 0 ? "#FFF5F5" : COLORS.white,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500, marginBottom: 8 }}>
                  Notifications
                </p>
                <p style={{
                  fontSize: 48, fontWeight: 700,
                  color: stats.unread_notifications > 0 ? "#C53030" : COLORS.navy,
                  fontFamily: "'Playfair Display', serif", lineHeight: 1,
                }}>
                  {stats.unread_notifications}
                </p>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: stats.unread_notifications > 0 ? "#FEB2B220" : `${COLORS.muted}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>🔔</div>
            </div>
            <p style={{
              fontSize: 12, marginTop: 14, fontWeight: 500,
              color: stats.unread_notifications > 0 ? "#C53030" : COLORS.muted,
            }}>
              {stats.unread_notifications > 0 ? "Unread alerts" : "All caught up"}
            </p>
          </div>
        </div>

        {/* ── Bottom Grid: Search + Activity ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>

          {/* Patient Search */}
          <div className="fade-up-3">
            <div className="section-card">
              <h2 className="section-title">
                <span>◧</span> Patient Search
              </h2>
              <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20 }}>
                Search for patients who have granted you access to their records.
              </p>
              <form onSubmit={handleSearch}>
                <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                  <input
                    className="search-bar"
                    placeholder="Search by patient name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="search-btn" disabled={searching}>
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
              </form>

              {/* Empty search state */}
              <div className="empty-state">
                <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
                <p style={{ fontWeight: 600, color: COLORS.navy, marginBottom: 6 }}>
                  Search for a patient
                </p>
                <p style={{ fontSize: 13 }}>
                  Enter a patient's name or email above to view their shared records.
                </p>
              </div>
            </div>

            {/* AI Summary CTA */}
            <div className="section-card fade-up-4" style={{
              marginTop: 24,
              background: `linear-gradient(135deg, ${COLORS.navy} 0%, #0D1F3C 100%)`,
              border: "none",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 17, color: COLORS.white, marginBottom: 6,
                  }}>
                    AI Clinical Summary
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 340 }}>
                    Select a patient to generate an instant AI-powered clinical summary from their full history.
                  </p>
                </div>
                <button className="ai-summary-btn">
                  ✦ Generate
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="fade-up-5">
            <div className="section-card">
              <h2 className="section-title">
                <span>◎</span> Recent Activity
              </h2>

              {recent_activity.length === 0 ? (
                <div className="empty-state">
                  <p style={{ fontSize: 28, marginBottom: 10 }}>📋</p>
                  <p>No recent activity yet.</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>
                    Actions you take will appear here.
                  </p>
                </div>
              ) : (
                recent_activity.map((entry, i) => {
                  const meta = ACTION_META[entry.action] ?? {
                    label: entry.action.replace(/_/g, " "),
                    icon: "◐",
                    color: COLORS.muted,
                  };
                  return (
                    <div key={i} className="activity-row">
                      <div
                        className="activity-icon"
                        style={{ background: `${meta.color}15` }}
                      >
                        <span style={{ color: meta.color, fontSize: 13 }}>{meta.icon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, marginBottom: 2 }}>
                          {meta.label}
                        </p>
                        <p style={{ fontSize: 11, color: COLORS.muted }}>
                          {entry.target_table} #{entry.target_id}
                        </p>
                      </div>
                      <p style={{
                        fontSize: 11, color: COLORS.muted,
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        {timeAgo(entry.performed_at)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DoctorDashboard;