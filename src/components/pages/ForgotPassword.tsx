import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import ONOLogo from '../../assets/ONOstories_logo.png';
import { supabase } from '../../lib/supabaseClient';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // This will send a password reset email to the user.
      const { error: supaError } = await supabase.auth.resetPasswordForEmail(email, {
        // The redirectTo URL should point to your "Update Password" page.
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (supaError) {
        if (supaError.message.includes('rate_limit') || supaError.message.includes('too_many')) {
          setError('Too many reset attempts. Please wait a few minutes before trying again.');
        } else if (supaError.message.includes('invalid_email') || supaError.message.includes('not_found')) {
          // For security reasons, we don't want to reveal if email exists or not
          setMessage('If an account with this email exists, password reset instructions have been sent to your email. Please check your inbox and spam folder.');
        } else {
          setError(supaError.message);
        }
      } else {
        setMessage('Password reset instructions have been sent to your email. Please check your inbox and spam folder.');
        setEmail(''); // Clear the input field on success
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f3e7fe 0%, #f9c6e0 50%, #f7b267 100%)' }}>
      <div className="max-w-md w-full bg-white/95 p-8 sm:p-10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
            <img src={ONOLogo} alt="ONO Stories Logo" className="w-24 h-24 mx-auto rounded-full shadow-lg mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Forgot Password
            </h1>
            <p className="text-gray-600 mt-2">Enter your email to get reset instructions.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p>Email Address</p>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value.trim())}
                required
                placeholder="Enter your registered email"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
          
          {error && (
            <div className="text-sm text-center text-red-600 pt-2 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-center text-green-600 pt-2 bg-green-50 p-3 rounded-lg">
              {message}
              <div className="text-xs mt-2 text-gray-600">
                Don't see the email? Check your spam folder or try again in a few minutes.
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

