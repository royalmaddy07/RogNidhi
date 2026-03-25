import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const GlobalLoginStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${COLORS.white};
      color: ${COLORS.text};
      font-family: 'DM Sans', sans-serif;
      overflow: hidden;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }

    .input-field {
      width: 100%;
      padding: 14px 16px;
      border-radius: 10px;
      border: 1.5px solid ${COLORS.border};
      background: ${COLORS.white};
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      transition: all 0.2s;
      outline: none;
      margin-bottom: 20px;
    }

    .input-field:focus {
      border-color: ${COLORS.teal};
      box-shadow: 0 0 0 4px ${COLORS.teal}15;
    }

    .btn-login {
      width: 100%;
      background: ${COLORS.teal};
      color: ${COLORS.navy};
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      font-weight: 600;
      padding: 14px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(0,201,167,0.3);
      margin-top: 10px;
    }

    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0,201,167,0.4);
    }

    .login-card {
      background: ${COLORS.white};
      border: 1px solid ${COLORS.border};
      border-radius: 24px;
      padding: 48px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 60px rgba(10,22,40,0.08);
      position: relative;
      z-index: 2;
    }

    .role-tab {
      flex: 1;
      padding: 10px;
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .role-active {
      background: ${COLORS.navy};
      color: ${COLORS.white};
    }

    .role-inactive {
      color: ${COLORS.muted};
    }
  `}</style>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for authentication goes here
    console.log(`Logging in as ${role}:`, { email, password });
    if (role === "patient") navigate("/Dashboard/PatientDashBoard");
    else navigate("/Dashboard/DoctorDashBoard");
  };

  return (
    <>
      <GlobalLoginStyle />
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 5% 5%, ${COLORS.teal}15 0%, transparent 40%), 
                     radial-gradient(circle at 95% 95%, ${COLORS.gold}15 0%, transparent 40%),
                     ${COLORS.white}`,
        padding: "20px"
      }}>
        
        {/* Floating Decorative Elements */}
        <div style={{
          position: "absolute", top: "10%", left: "10%", width: 150, height: 150,
          background: `${COLORS.teal}10`, borderRadius: "50%", filter: "blur(40px)"
        }} />

        <div className="login-card animate-slide-up">
          {/* Logo Heading */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navyMid})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, margin: "0 auto 16px"
            }}>📋</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: COLORS.navy }}>
              Welcome Back
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 4 }}>
              Securely access your health treasury
            </p>
          </div>

          {/* Role Switcher */}
          <div style={{
            display: "flex", background: COLORS.offWhite, padding: 6,
            borderRadius: 12, marginBottom: 32
          }}>
            <div 
              className={`role-tab ${role === "patient" ? "role-active" : "role-inactive"}`}
              onClick={() => setRole("patient")}
            >
              Patient
            </div>
            <div 
              className={`role-tab ${role === "doctor" ? "role-active" : "role-inactive"}`}
              onClick={() => setRole("doctor")}
            >
              Doctor
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy, display: "block", marginBottom: 8 }}>
                Email Address
              </label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="yash@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>
                  Password
                </label>
                <span style={{ fontSize: 12, color: COLORS.teal, fontWeight: 600, cursor: "pointer" }}>
                  Forgot?
                </span>
              </div>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-login">
              Sign In to RogNidhi
            </button>
          </form>

          {/* Footer Link */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <p style={{ fontSize: 14, color: COLORS.muted }}>
              New to the treasury?{" "}
              <span 
                onClick={() => navigate("/register")} 
                style={{ color: COLORS.teal, fontWeight: 600, cursor: "pointer" }}
              >
                Create Account
              </span>
            </p>
          </div>
        </div>

        {/* Back to Home Button */}
        <div 
          onClick={() => navigate("/")}
          style={{
            position: "absolute", top: 40, left: 40, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, color: COLORS.muted,
            fontSize: 14, fontWeight: 500
          }}
        >
          <span>←</span> Back to Home
        </div>
      </div>
    </>
  );
};

export default Login;