import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import ONOLogo from '../../assets/ONOstories_logo.jpg';
import { supabase } from '../../lib/supabaseClient';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export function UpdatePasswordSimple() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Check URL parameters for recovery tokens
      const urlParams = new URLSearchParams(location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      
      // If we have tokens, set the session first
      if (accessToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });
      }
      
      // Try to update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError('Password update failed. Please try again or request a new reset link.');
      } else {
        setMessage('Password updated successfully! You can now login with your new password.');
        setPassword('');
        setConfirmPassword('');
        
        // Clean logout
        await supabase.auth.signOut();
        
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
            Set New Password
          </h1>
          <p className="text-gray-600 mt-2">Enter and confirm your new password below.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="password">New Password</Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password (min. 6 characters)"
                className="pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                className="pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>
          
          {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
          {message && <p className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-lg">{message}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Having trouble?{' '}
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-purple-600 hover:text-purple-700 font-semibold underline"
            >
              Request a new reset link
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}