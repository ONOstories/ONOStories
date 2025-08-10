// src/components/Navbar.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { Lock } from "lucide-react";
import logo from '../assets/ONOstories_logo.jpg'; 

const Navbar = () => {
  const { user, logout, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  // State to track whether the page has been scrolled
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to add and remove a scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      // Set state to true if scrolled more than 50px, otherwise false
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

  const handleCreateStoriesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/pricing');
  };
  
  // Conditionally set the styles for links based on scroll position
  const linkStyle = {
    textShadow: isScrolled ? 'none' : '1px 1px 4px rgba(0, 0, 0, 0.7)',
  };
  const linkClassName = isScrolled 
    ? "text-gray-700 hover:text-indigo-600" 
    : "text-white hover:text-gray-200";

  const renderAuthButtons = () => {
    if (loading) {
      return <div className="h-10 w-28" />; 
    }

    if (user) {
      return (
        <div className="flex items-center space-x-4">
          {(profile?.name || profile?.email) && (
            <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
              {profile?.name || profile?.email?.split('@')[0]}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      );
    }
    
    // Auth buttons also change with scroll for consistency
    return (
      <div className="space-x-2">
        <Link 
          to="/login" 
          className={`px-4 py-2 text-sm font-bold rounded-md transition-colors duration-300 ${isScrolled ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-white bg-black/20 hover:bg-black/30'}`}
          style={linkStyle}
        >
          Login
        </Link>
        <Link 
          to="/signup" 
          className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#9333EA] to-[#DB2777] rounded-md hover:from-[#7E22CE] hover:to-[#BE185D]"
          style={linkStyle}
        >
          Sign Up
        </Link>
      </div>
    );
  };

  return (
    // Navbar classes now dynamically change based on scroll position
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                className="h-10 w-auto"
                src={logo}
                alt="ONO Stories Logo"
              />
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
            <Link to="/" className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`} style={linkStyle}>
              Home
            </Link>
            <Link to="/story-library" className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`} style={linkStyle}>
              Story Library
            </Link>
            {user && profile?.role === 'prouser' ? (
              <Link to="/create-stories" className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`} style={linkStyle}>
                Create Stories
              </Link>
            ) : (
              <span onClick={handleCreateStoriesClick} className={`cursor-pointer inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${isScrolled ? 'text-gray-400' : 'text-white/70'}`} title="Only available to Pro users" style={isScrolled ? {} : linkStyle}>
                <Lock className={`h-4 w-4 mr-1 transition-colors duration-300 ${isScrolled ? 'text-gray-400' : 'text-white/70'}`} />
                Create Stories
              </span>
            )}
            <Link to="/pricing" className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`} style={linkStyle}>
              Pricing
            </Link>
          </div>
          <div className="flex items-center">
            {renderAuthButtons()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;