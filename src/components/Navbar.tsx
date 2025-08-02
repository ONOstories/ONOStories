

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { Lock } from "lucide-react";

const Navbar = () => {
  const { user, logout, profile, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

  const handleCreateStoriesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/pricing');
  };

  const renderAuthButtons = () => {
    // While loading, render a placeholder to prevent layout shift.
    if (loading) {
      return <div className="h-10 w-28" />; 
    }

    // If loading is complete and a user exists, show their info and the logout button.
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

    // If loading is complete and no user exists, show the login and signup buttons.
    return (
      <div className="space-x-2">
        <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Login
        </Link>
        <Link to="/signup" className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Sign Up
        </Link>
      </div>
    );
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              ONO Stories
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
            <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
              Home
            </Link>
            <Link to="/story-library" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
              Story Library
            </Link>
            {user && profile?.role === 'prouser' ? (
              <Link to="/create-stories" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                Create Stories
              </Link>
            ) : (
              <span onClick={handleCreateStoriesClick} className="cursor-pointer inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-400" title="Only available to Pro users">
                <Lock className="h-4 w-4 mr-1 text-gray-400" />
                Create Stories
              </span>
            )}
            <Link to="/pricing" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
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


