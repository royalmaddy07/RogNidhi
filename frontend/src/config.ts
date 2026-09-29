// Central API configuration
// In production, set REACT_APP_API_BASE in Vercel Environment Variables
// to your Render backend URL (e.g., https://your-app.onrender.com/api)
export const API_BASE = (process.env.REACT_APP_API_BASE || "https://rognidhi-bda8.onrender.com").replace(/\/+$/, "");
