import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Clock, FileUp, Share2, TrendingUp, ShieldCheck, CreditCard, LogOut
} from "lucide-react";

const COLORS = {
  navy: "#0A1628",
  navyMid: "#112240",
  teal: "#00C9A7",
};

interface SidebarProps {
  user: { name: string; id?: number };
}

const NAV_ITEMS = [
  { path: "/DashBoard/PatientDashboard", label: "Timeline",         icon: Clock },
  { path: null,                          label: "Health Trends",    icon: TrendingUp },
  { path: "/DashBoard/RogNidhiHistory",  label: "RogNidhi History", icon: Share2 },
  { path: null,                          label: "Access Control",   icon: FileUp },
  { path: null,                          label: "Insurance",        icon: CreditCard },
];

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside style={{
      width: 260,
      background: `linear-gradient(180deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`,
      padding: "36px 18px",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      height: "100vh",
      color: "#fff",
      zIndex: 100,
    }}>
      <style>{`
        .sb-nav-item {
          transition: all 0.18s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 10px;
          color: rgba(255,255,255,0.5);
          font-weight: 500;
          font-size: 14px;
        }
        .sb-nav-item:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .sb-nav-item.active {
          background: ${COLORS.teal};
          color: ${COLORS.navy};
          font-weight: 700;
          box-shadow: 0 6px 16px rgba(0,201,167,0.22);
        }
        .sb-logout-btn { transition: all 0.18s ease; }
        .sb-logout-btn:hover { background: #fee2e2 !important; color: #ef4444 !important; }
      `}</style>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 44, paddingLeft: 8 }}>
        <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.08)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
          <ShieldCheck size={19} color={COLORS.teal} />
        </div>
        <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.5px" }}>RogNidhi</span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flexGrow: 1 }}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = path && location.pathname === path;
          return (
            <div
              key={label}
              className={`sb-nav-item${isActive ? " active" : ""}`}
              onClick={() => path && navigate(path)}
            >
              <Icon size={16} />
              {label}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: COLORS.teal, color: COLORS.navy, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>ID: #RN-{user.id ?? "001"}</div>
          </div>
        </div>
        <button
          className="sb-logout-btn"
          onClick={() => { localStorage.clear(); navigate("/"); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
