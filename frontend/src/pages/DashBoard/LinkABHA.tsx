import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { Link, Fingerprint, ShieldCheck, CheckCircle2, ChevronRight, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = {
  navy: "#0A1628",
  navyMid: "#112240",
  teal: "#00C9A7",
  tealLight: "#E0FDF6",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  border: "#E2E8F0",
  muted: "#64748B",
  gradientStart: "#00C9A7",
  gradientEnd: "#009B82",
};

const LinkABHA: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [abhaNumber, setAbhaNumber] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.offWhite }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        .abha-input::placeholder { color: #94A3B8; }
        .abha-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .abha-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 201, 167, 0.25);
        }
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.3) 50%,
            rgba(255,255,255,0) 100%
          );
          transform: rotate(30deg);
          animation: shine 6s infinite;
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(30deg); }
          20%, 100% { transform: translateX(100%) rotate(30deg); }
        }
      `}</style>
      
      <Sidebar user={user} />
      
      <main style={{ flexGrow: 1, marginLeft: 260, padding: "40px", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: COLORS.navy, letterSpacing: "-0.5px", margin: 0 }}>
              National Health Registry
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 15, marginTop: 8 }}>
              Securely connect your Ayushman Bharat Health Account
            </p>
          </div>
          
          <div style={{ 
            background: "rgba(99, 102, 241, 0.1)", 
            color: "#6366F1", 
            padding: "8px 16px", 
            borderRadius: 99, 
            fontSize: 13, 
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            <Zap size={14} /> FUTURE SHOWCASE
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 32, flex: 1 }}>
          
          {/* Left: Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ 
              background: COLORS.white, 
              borderRadius: 24, 
              padding: 40,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              border: `1px solid ${COLORS.border}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ 
              width: 56, height: 56, borderRadius: 16, 
              background: COLORS.tealLight, 
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 24
            }}>
              <Fingerprint size={28} color={COLORS.teal} strokeWidth={2.5} />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.navy, marginBottom: 12 }}>
              Link your ABHA ID
            </h2>
            <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              Connecting your ABHA allows RogNidhi to fetch your nationwide medical history securely. Your data is encrypted and remains under your absolute control.
            </p>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>
                14-Digit ABHA Number
              </label>
              <div style={{
                display: "flex",
                alignItems: "center",
                background: COLORS.offWhite,
                border: `2px solid ${isFocused ? COLORS.teal : COLORS.border}`,
                borderRadius: 14,
                padding: "14px 16px",
                transition: "all 0.2s ease"
              }}>
                <span style={{ color: COLORS.muted, fontWeight: 600, marginRight: 8 }}>ABHA -</span>
                <input
                  type="text"
                  className="abha-input"
                  placeholder="0000 - 0000 - 0000 - 00"
                  value={abhaNumber}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    let formatted = val;
                    if (val.length > 4) formatted = val.slice(0, 4) + " - " + val.slice(4);
                    if (val.length > 8) formatted = formatted.slice(0, 11) + " - " + val.slice(8);
                    if (val.length > 12) formatted = formatted.slice(0, 18) + " - " + val.slice(12, 14);
                    setAbhaNumber(formatted.slice(0, 23));
                  }}
                  style={{
                    border: "none", background: "transparent", outline: "none",
                    flex: 1, fontSize: 16, fontWeight: 600, color: COLORS.navy,
                    letterSpacing: "1px"
                  }}
                />
              </div>
            </div>

            <button 
              className="abha-btn shine-effect"
              disabled={abhaNumber.length < 14}
              style={{
                background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})`,
                color: "#fff", border: "none", padding: "16px 24px",
                borderRadius: 14, fontSize: 15, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: abhaNumber.length >= 14 ? "pointer" : "not-allowed",
                opacity: abhaNumber.length >= 14 ? 1 : 0.6,
                marginTop: "auto"
              }}
            >
              <Link size={18} /> Authenticate & Link Account
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>
              <ShieldCheck size={14} color={COLORS.teal} /> 
              Protected by 256-bit encryption
            </div>
          </motion.div>

          {/* Right: Info Graphics */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            style={{ 
              background: COLORS.navy, 
              borderRadius: 24, 
              padding: 40,
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Background pattern */}
            <div style={{
              position: "absolute", top: -100, right: -100, width: 300, height: 300,
              background: `radial-gradient(circle, ${COLORS.teal}22 0%, transparent 70%)`
            }} />
            
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <Activity size={24} color={COLORS.tealLight} />
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "1px", color: COLORS.tealLight, textTransform: "uppercase" }}>
                  Seamless Integration
                </span>
              </div>
              
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>
                One interface for all your health records.
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.6 }}>
                Once your ABHA account is linked, RogNidhi acts as your unified health locker, pulling diagnostics, prescriptions, and summaries from every registered hospital nationwide.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 40 }}>
              {[
                "Government Verified Health ID Integration",
                "Instant syncing of external medical records",
                "Consent-driven data sharing with doctors",
                "Real-time centralized health timeline"
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ background: "rgba(0, 201, 167, 0.2)", padding: 6, borderRadius: "50%" }}>
                    <CheckCircle2 size={16} color={COLORS.teal} />
                  </div>
                  <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Simulated Link Card */}
            <div style={{ 
              marginTop: 40, 
              background: "rgba(255,255,255,0.06)", 
              borderRadius: 16, 
              padding: 20,
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Emblem_of_India.svg/200px-Emblem_of_India.svg.png" alt="Gov" style={{ height: 24, opacity: 0.8 }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>ABHA Network</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Status: Disconnected</div>
                </div>
              </div>
              <ChevronRight color="rgba(255,255,255,0.3)" />
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LinkABHA;
