import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { Lock, Menu, X, User as UserIcon } from "lucide-react";
import logo from '../assets/ONOstories_logo.jpg';
import ProfileDropdown from "./ProfileDropdown";


type NavbarProps = {
  forceSolidBackground?: boolean;
};


const Navbar = ({ forceSolidBackground = false }: NavbarProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const atHome = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);


  useEffect(() => {
    if (!atHome) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [atHome]);


  useEffect(() => { setMenuOpen(false); }, [location.pathname]);


  const requireAuth = (e: React.MouseEvent, targetPath: string) => {
    if (loading) return;
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { redirectTo: targetPath, from: location.pathname } });
    }
  };


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


  const showTransparent = atHome && !isScrolled && !forceSolidBackground;
  const isSolid = !showTransparent;


  const linkStyle = { textShadow: isSolid ? 'none' : '1px 1px 4px rgba(0, 0, 0, 0.7)' };
  const linkClassName = isSolid ? "text-gray-700 hover:text-indigo-600" : "text-white hover:text-gray-200";


  const renderAuthButtons = (mobile = false) => {
    if (loading) {
      return <div className="h-10 w-28" />;
    }
    if (user) {
      return (
        <div className={`relative flex items-center ${mobile ? "flex-col gap-3 mt-6 w-full" : "space-x-4"}`}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="rounded-full bg-gray-200 p-2 hover:bg-gray-300"
          >
            <UserIcon className="h-6 w-6 text-gray-700" />
          </button>
          {/* MODIFICATION: Pass the `mobile` prop */}
          {profileOpen && <ProfileDropdown close={() => setProfileOpen(false)} mobile={mobile} />}
        </div>
      );
    }
    return (
      <div className={mobile ? "space-y-3 mt-6 flex flex-col w-full" : "space-x-2"}>
        <Link
          to="/login"
          className={`px-4 py-2 text-sm font-bold rounded-md transition-colors duration-300 w-full ${isSolid ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-white bg-black/20 hover:bg-black/30'}`}
          style={linkStyle}
        >
          Login
        </Link>
        <Link
          to="/signup"
          className={`px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#9333EA] to-[#DB2777] rounded-md hover:from-[#7E22CE] hover:to-[#BE185D] w-full`}
          style={linkStyle}
        >
          Sign Up
        </Link>
      </div>
    );
  };


  const navLinks = (
    <>
      <Link
        to="/"
        className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`}
        style={linkStyle}
      >Home</Link>
      <Link
        to="/about"
        className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`}
        style={linkStyle}
      >About Us</Link>
      <Link
        to="/story-library"
        onClick={e => requireAuth(e, '/story-library')}
        className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`}
        style={linkStyle}
      >Story Library</Link>
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
        onClick={e => requireAuth(e, '/pricing')}
        className={`inline-flex items-center px-1 pt-1 text-sm font-bold transition-colors duration-300 ${linkClassName}`}
        style={linkStyle}
      >Pricing</Link>
    </>
  );


  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${showTransparent ? "bg-transparent" : "bg-white shadow-md"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <img className="h-10 w-auto" src={logo} alt="ONO Stories Logo" />
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
            {navLinks}
          </div>
          <div className="hidden sm:flex items-center">{renderAuthButtons()}</div>
          <button
            type="button"
            className="sm:hidden flex items-center justify-center rounded p-2 text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-100"
            aria-label="Open menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex sm:hidden">
          <div className={`bg-black w-72 max-w-[80vw] h-full p-6 flex flex-col`}>
            <button
              type="button"
              className="self-end mb-4 text-gray-700"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-8 w-8" />
            </button>
            <nav className="flex flex-col gap-3">
              {navLinks}
            </nav>
            {renderAuthButtons(true)}
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
};


export default Navbar;