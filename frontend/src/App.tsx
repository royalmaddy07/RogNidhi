import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Import pages
import Landing from "./pages/Landing";
import Login from "./pages/Auth/login";
import Register from "./pages/Auth/register";
import PatientDashboard from './pages/Dashboard/PatientDashboard';
import DoctorDashboard from './pages/Dashboard/DoctorDashboard';
import { GlobalChatBot } from './components/GlobalChatBot';
import RogNidhiHistory from './pages/Dashboard/RogNidhiHistory';
import PatientAccessControl from "./pages/Dashboard/PatientAccessControl";
import DoctorAccessControl from "./pages/Dashboard/DoctorAccessControl";
import DoctorPatientRecords from "./pages/Dashboard/DoctorPatientRecords";
import HealthTrends from "./pages/Dashboard/HealthTrends";

function App() {
  return (
    <BrowserRouter>
      <GlobalChatBot />
      <Routes>
        {/* Public Landing & Auth */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Routes */}
        <Route path="/Dashboard/PatientDashboard" element={<PatientDashboard />} />
        <Route path="/Dashboard/HealthTrends" element={<HealthTrends />} />
        <Route path="/Dashboard/DoctorDashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/patient-records/:patientId" element={<DoctorPatientRecords />} />
        <Route path="/Dashboard/RogNidhiHistory" element={<RogNidhiHistory />} />

        {/* Access Control Routes */}
        <Route path="/access-control" element={<PatientAccessControl />} />
        <Route path="/doctor-access-control" element={<DoctorAccessControl />} />

        {/* Wildcard Fallback: MUST BE LAST */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;