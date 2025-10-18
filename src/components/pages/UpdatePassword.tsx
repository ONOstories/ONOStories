import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import ONOLogo from '../../assets/ONOstories_logo.png';
import { supabase } from '../../lib/supabaseClient';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const setupRecoverySession = async () => {
      try {
        // Get hash parameters from URL
        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');
          
          if (type === 'recovery' && accessToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (!error) {
              setSessionReady(true);
            } else {
              setError('Invalid recovery link. Please request a new one.');
            }
          } else {
            setError('Invalid recovery link. Please request a new one.');
          }
        } else {
          setError('Invalid recovery link. Please request a new one.');
        }
      } catch (err) {
        setError('Error setting up recovery session.');
      } finally {
        setChecking(false);
      }
    };

    setupRecoverySession();
  }, []);

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

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError('Failed to update password. Please try again.');
      } else {
        setMessage('Password updated successfully! Redirecting...');
        await supabase.auth.signOut();
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f3e7fe 0%, #f9c6e0 50%, #f7b267 100%)' }}>
        <div className="max-w-md w-full bg-white/95 p-8 rounded-3xl shadow-2xl text-center">
          <img src={ONOLogo} alt="ONO Stories" className="w-24 h-24 mx-auto rounded-full mb-4" />
          <p>Verifying recovery link...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f3e7fe 0%, #f9c6e0 50%, #f7b267 100%)' }}>
        <div className="max-w-md w-full bg-white/95 p-8 rounded-3xl shadow-2xl text-center">
          <img src={ONOLogo} alt="ONO Stories" className="w-24 h-24 mx-auto rounded-full mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-4">Link Invalid</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f3e7fe 0%, #f9c6e0 50%, #f7b267 100%)' }}>
      <div className="max-w-md w-full bg-white/95 p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <img src={ONOLogo} alt="ONO Stories" className="w-24 h-24 mx-auto rounded-full shadow-lg mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Set New Password
          </h1>
          <p className="text-gray-600 mt-2">Enter your new password below.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p>New Password</p>
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
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>
          
          <div>
            <p>Confirm New Password</p>
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
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
          </div>
          
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">{error}</div>}
          {message && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg text-center">{message}</div>}

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}