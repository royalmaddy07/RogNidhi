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

const GlobalRegisterStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: ${COLORS.white};
      color: ${COLORS.text};
      font-family: 'DM Sans', sans-serif;
      overflow-x: hidden;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    .input-group {
      margin-bottom: 20px;
      text-align: left;
    }

    .input-label {
      font-size: 13px;
      font-weight: 600;
      color: COLORS.navy;
      display: block;
      margin-bottom: 8px;
    }

    .input-field {
      width: 100%;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1.5px solid ${COLORS.border};
      background: ${COLORS.white};
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      transition: all 0.2s;
      outline: none;
    }

    .input-field:focus {
      border-color: ${COLORS.teal};
      box-shadow: 0 0 0 4px ${COLORS.teal}15;
    }

    .btn-register {
      width: 100%;
      background: ${COLORS.teal};
      color: ${COLORS.navy};
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      font-weight: 600;
      padding: 14px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 4px 20px rgba(0,201,167,0.3);
      margin-top: 10px;
    }

    .btn-register:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,201,167,0.45);
    }

    .register-card {
      background: ${COLORS.white};
      border: 1px solid ${COLORS.border};
      border-radius: 28px;
      padding: 40px 48px;
      width: 100%;
      max-width: 550px;
      box-shadow: 0 30px 70px rgba(10,22,40,0.06);
      position: relative;
      z-index: 2;
    }

    .role-select {
      display: flex;
      gap: 12px;
      margin-bottom: 30px;
    }

    .role-option {
      flex: 1;
      padding: 12px;
      border: 1.5px solid ${COLORS.border};
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
      color: ${COLORS.muted};
    }

    .role-option.active {
      border-color: ${COLORS.teal};
      background: ${COLORS.teal}08;
      color: ${COLORS.teal};
      font-weight: 600;
    }
  `}</style>
);

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Registration logic
    navigate(role === "patient" ? "/Dashboard/PatientDashBoard" : "/Dashboard/DoctorDashBoard");
  };

  return (
    <>
      <GlobalRegisterStyle />
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 90% 10%, ${COLORS.teal}12 0%, transparent 40%), 
                     radial-gradient(circle at 10% 90%, ${COLORS.gold}12 0%, transparent 40%),
                     ${COLORS.white}`,
        padding: "40px 20px"
      }}>

        <div className="register-card animate-slide-up">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navyMid})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, margin: "0 auto 16px"
            }}>📜</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: COLORS.navy }}>
              Join the Treasury
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 4 }}>
              Start your journey toward organized health clarity
            </p>
          </div>

          {/* Role Selection */}
          <div className="role-select">
            <div 
              className={`role-option ${role === "patient" ? "active" : ""}`}
              onClick={() => setRole("patient")}
            >
              I am a Patient
            </div>
            <div 
              className={`role-option ${role === "doctor" ? "active" : ""}`}
              onClick={() => setRole("doctor")}
            >
              I am a Doctor
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" placeholder="Yash Patel" required />
              </div>
              <div className="input-group">
                <label className="input-label">Contact Number</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210" required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input type="email" className="input-field" placeholder="yash@nitj.ac.in" required />
            </div>

            {role === "doctor" && (
              <div className="input-group">
                <label className="input-label">Medical Registration Number (MCI/NMC)</label>
                <input type="text" className="input-field" placeholder="MCI-12345" required />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" className="input-field" placeholder="••••••••" required />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input type="password" className="input-field" placeholder="••••••••" required />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "24px", alignItems: "flex-start" }}>
              <input type="checkbox" style={{ marginTop: "4px", cursor: "pointer" }} required />
              <p style={{ fontSize: "12px", color: COLORS.muted, lineHeight: "1.5" }}>
                I agree to the RogNidhi <span style={{ color: COLORS.teal, fontWeight: 600 }}>Terms of Service</span> and 
                acknowledge the <span style={{ color: COLORS.teal, fontWeight: 600 }}>Privacy Policy</span> regarding my medical data.
              </p>
            </div>

            <button type="submit" className="btn-register">
              Create My Health Treasury
            </button>
          </form>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <p style={{ fontSize: "14px", color: COLORS.muted }}>
              Already have an account?{" "}
              <span 
                onClick={() => navigate("/login")} 
                style={{ color: COLORS.teal, fontWeight: 600, cursor: "pointer" }}
              >
                Sign In
              </span>
            </p>
          </div>
        </div>

        {/* Back Home */}
        <div 
          onClick={() => navigate("/")}
          style={{
            position: "absolute", top: 40, left: 40, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, color: COLORS.muted,
            fontSize: 14, fontWeight: 500
          }}
        >
          <span>←</span> Back
        </div>
      </div>
    </>
  );
};

export default Register;