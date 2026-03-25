import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import pages
import Landing from "./pages/Landing";
import Login from "./pages/Auth/login";
import Register from "./pages/Auth/register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;