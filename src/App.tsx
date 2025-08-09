import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/pages/Home";
import { Login } from "./components/pages/Login";
import { Signup } from "./components/pages/Signup";
import { Pricing } from "./components/pages/Pricing";
import { CreateStories } from "./components/CreateStories";
import  StoryLibrary  from "./components/StoryLibrary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { EmailConfirmed } from './components/pages/EmailConfirmed';

function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/story-library" element={<StoryLibrary />} />
          <Route path="/email-confirmed" element={<EmailConfirmed />} />   
          {/* Protected Route for Create Stories */}
          <Route element={<ProtectedRoute allowedRoles={['prouser']} />}>
            <Route path="/create-stories" element={<CreateStories />} />
          </Route>

        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
