// src/components/auth/EmailConfirmed.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import ONOLogo from '../../assets/ONOstories_logo.png';
import { supabase } from '../../lib/supabaseClient';

export function EmailConfirmed() {
  // Avoid leaving a session in this verification tab
  useEffect(() => {
    // Scope: 'local' ensures only this device/tab session is cleared
    // (keeps other sessions intact)
    supabase.auth.signOut({ scope: 'local' });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          'linear-gradient(135deg, #f3e7fe 0%, #f9c6e0 50%, #f7b267 100%)',
      }}
    >
      <div className="max-w-md w-full bg-white/95 p-8 sm:p-10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <img
            src={ONOLogo}
            alt="ONO Stories Logo"
            className="w-24 h-24 mx-auto rounded-full shadow-lg mb-4"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Email verified!
          </h1>
          <p className="text-gray-600 mt-2">
            You may now close this tab and sign in to continue your adventure.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <span className="text-gray-700">
              The email address is now confirmed.
            </span>
          </div>

          {/* <div className="w-full space-y-3">
            <Link
              to="/"
              className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Go to Home
            </Link>
            <Link
              to="/login"
              className="block w-full text-center bg-white text-purple-700 border border-purple-200 py-3 px-4 rounded-lg font-semibold hover:bg-purple-50 transition-all"
            >
              Sign in
            </Link>
          </div> */}

          {/* <p className="text-sm text-gray-500 text-center">
            This tab can be closed after proceeding.
          </p> */}
        </div>
      </div>
    </div>
  );
}
