// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./components/pages/Home";
import { Login } from "./components/pages/Login";
import { Signup } from "./components/pages/Signup";
import { Pricing } from "./components/pages/Pricing";
import { StoryLibrary } from "./components/StoryLibrary";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <Navbar />

        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/signup"    element={<Signup />} />
          <Route path="/pricing"   element={<Pricing />} />
          <Route path="/library"   element={<StoryLibrary />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*"          element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
