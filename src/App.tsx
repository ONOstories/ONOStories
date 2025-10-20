import React, { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import Pages and Components
import { Home } from "./components/pages/Home";
import { Login } from "./components/pages/Login";
import { Signup } from "./components/pages/Signup";
import { Pricing } from "./components/pages/Pricing";
import { CreateStories } from "./components/CreateStories";
import StoryLibrary from "./components/StoryLibrary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { EmailConfirmed } from './components/pages/EmailConfirmed';
import { StoryLoading } from './components/StoryLoading';
import { AboutUs } from "./components/pages/AboutUs";
import StorybookGem from "./components/pages/StorybookGem";
import { ForgotPassword } from "./components/pages/ForgotPassword";
import { UpdatePassword } from "./components/pages/UpdatePassword";

// Import the new preloading hook
import { useImagePreloader } from './hooks/useImagePreloader';

// Import images that are critical for the initial view
import logo from './assets/ONOstories_logo.png';
import first from './assets/first.webp';
import second from './assets/second.webp';
import third from './assets/third.webp';
import fourth from './assets/fourth.webp';
import fifth from './assets/fifth.webp';

// --- Simple loader component to display during preloading ---
const AppLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center relative bg-gradient-to-br from-[#f3e7fe] via-[#f9c6e0] to-[#f7b267] overflow-hidden">
    {/* Magical animated background sparkles */}
    <div className="absolute inset-0 pointer-events-none z-0">
      {[...Array(22)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/30"
          style={{
            width: Math.random() * 32 + 18,
            height: Math.random() * 32 + 18,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: "0 0 12px #fff8",
            opacity: Math.random() * 0.14 + 0.08,
            animation: `apploader-float ${Math.random() * 2 + 2}s ${
              Math.random() * 2
            }s ease-in-out infinite alternate`,
            filter: "blur(1.5px)",
          }}
        />
      ))}
    </div>
    <div className="text-center relative z-10 p-4">
      <p className="text-lg md:text-xl font-bold text-purple-800 flex items-center justify-center gap-2">
        Loading
        <span className="animate-app-loader-dots ml-1 text-purple-800 text-base md:text-lg font-black">...</span>
      </p>
    </div>
    <style>{`
      @keyframes apploader-float {
        0% { transform: translateY(0);}
        100% { transform: translateY(16px); }
      }
      .animate-app-loader-breathe {
        animation: app-breathe 2.2s ease-in-out infinite;
      }
      @keyframes app-breathe {
        0%, 100% { transform: scale(1);}
        50% { transform: scale(1.065);}
      }
      .animate-app-loader-pulse-glow {
        animation: app-pulse-glow 1.4s infinite alternate cubic-bezier(.4,0,.2,1);
      }
      @keyframes app-pulse-glow {
        0% { box-shadow: 0 0 28px 2px #efbffd33, 0 0 0 #fff0;}
        100% { box-shadow: 0 0 33px 10px #d8aff733, 0 0 8px #ffe;}
      }
      .animate-app-loader-dots:after {
        display: inline-block;
        content: '';
        animation: app-dots 1.3s linear infinite;
      }
      @keyframes app-dots {
        0% {content: '';}
        33% {content: '.';}
        66% {content: '..';}
        100% {content: '...';}
      }
      .animate-app-loader-shimmer {
        animation: shimmer 1.8s infinite linear;
      }
      @keyframes shimmer {
        0% { left: -40%;}
        100% { left: 100%;}
      }
    `}</style>
  </div>
);


function App() {
  // Define the list of images to preload using useMemo for optimization
  const imagesToPreload = useMemo(() => [
    logo,
    first,
    second,
    third,
    fourth,
    fifth,
  ], []);

  // The hook returns `true` once all images in the list have been loaded
  const allImagesLoaded = useImagePreloader(imagesToPreload);

  // While images are loading, show the AppLoader component
  if (!allImagesLoaded) {
    return <AppLoader />;
  }

  // Once images are loaded, render the full application
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/story-library" element={<StoryLibrary />} />
          <Route path="/story-loading" element={<StoryLoading />} />
          <Route path="/story/:storyId" element={<StorybookGem />} />
          <Route path="/email-confirmed" element={<EmailConfirmed />} />
          <Route path="/about" element={<AboutUs />} />
          
          {/* Protected Route for Create Stories */}
          <Route element={<ProtectedRoute allowedRoles={['prouser']} />}>
            <Route path="/create-stories" element={<CreateStories />} />
            <Route path="/creating-story" element={<StoryLoading />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
