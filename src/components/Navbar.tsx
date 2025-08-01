// src/components/Navbar.tsx
"use client";
import { BookOpen, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // For demo purposes, assume logged in

  /* helper to style active tab */
  const tab = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === path
        ? "text-purple-600 bg-purple-50"
        : "text-gray-700 hover:text-purple-600"
    }`;

  const handleLogout = () => {
    // Simulate logout
    alert("You have been logged out successfully!");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <BookOpen className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ONOSTORIES
          </span>
        </button>

        {/* nav links */}
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/")} className={tab("/")}>
            Home
          </button>
          <button onClick={() => navigate("/library")} className={tab("/library")}>
            Story&nbsp;Library
          </button>
          <button onClick={() => navigate("/dashboard")} className={tab("/dashboard")}>
            Create&nbsp;Stories
          </button>
          <button onClick={() => navigate("/pricing")} className={tab("/pricing")}>
            Pricing
          </button>
          
          {/* Logout button */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
