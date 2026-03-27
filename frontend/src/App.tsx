import { BrowserRouter, Router, Routes, Route, Navigate } from 'react-router-dom';
// Import pages
import Landing from "./pages/Landing";
import Login from "./pages/Auth/login";
import Register from "./pages/Auth/register";
import PatientDashboard from './pages/DashBoard/PatientDashboard';
import DoctorDashboard from './pages/DashBoard/DoctorDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Routes - Matching your Login.tsx navigation logic */}
        <Route path="/DashBoard/PatientDashboard" element={<PatientDashboard />} />
        <Route path="/DashBoard/DoctorDashboard" element={<DoctorDashboard />} />

        {/* Fallback: Redirect unknown routes to Landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;