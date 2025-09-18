import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { Lock } from "lucide-react";
import logo from '../assets/ONOstories_logo.jpg';

type NavbarProps = {
  forceSolidBackground?: boolean;
};

const Navbar = ({ forceSolidBackground = false }: NavbarProps) => {
  const { user, logout, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Generic guard: if not logged in, send to /login and remember where the user wanted to go
  const requireAuth = (e: React.MouseEvent, targetPath: string) => {
    if (loading) return; // ignore while hydrating
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { redirectTo: targetPath, from: location.pathname } });
    }
  };

  // Create Stories needs both: login + pro role
  const handleCreateStoriesClick = (e: React.MouseEvent) => {
    if (loading) return;
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { redirectTo: '/create-stories', from: location.pathname } });
      return;
    }
    if (profile?.role !== 'prouser') {
      e.preventDefault();
      navigate('/pricing');
    }
  };

  const isSolid = isScrolled || forceSolidBackground;

  const linkStyle = {
    textShadow: isSolid ? 'none' : '1px 1px 4px rgba(0, 0, 0, 0.7)',
  };
  const linkClassName = isSolid
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

    return (
      <div className="space-x-2">
        <Link
          to="/login"
          className={`px-4 py-2 text-sm font-bold rounded-md transition-colors duration-300 ${isSolid ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-white bg-black/20 hover:bg-black/30'}`}
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isSolid ? 'bg-white shadow-md' : 'bg-transparent'}`}>
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
            <Link
              to="/"
              className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`}
              style={linkStyle}
            >
              Home
            </Link>

            <Link
              to="/about"
              className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`}
              style={linkStyle}
            >
              About Us
            </Link>

            <Link
              to="/story-library"
              onClick={(e) => requireAuth(e, '/story-library')}
              className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`}
              style={linkStyle}
            >
              Story Library
            </Link>

            <Link
              to="/create-stories"
              onClick={handleCreateStoriesClick}
              className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`}
              style={linkStyle}
              title={!user ? 'Login required' : profile?.role !== 'prouser' ? 'Pro plan required' : undefined}
            >
              {(!user || profile?.role !== 'prouser') && (
                <Lock className={`h-4 w-4 mr-1 transition-colors duration-300 ${isSolid ? 'text-gray-400' : 'text-white/70'}`} />
              )}
              Create Stories
            </Link>

            <Link
              to="/pricing"
              onClick={(e) => requireAuth(e, '/pricing')}
              className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`}
              style={linkStyle}
            >
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
