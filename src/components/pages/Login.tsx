import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import ONOLogo from '../../assets/ONOstories_logo.jpg';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthProvider';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    console.log('[Login] Attempting login', formData);
    const { error: supaError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (supaError) {
      console.error('[Login] Login error', supaError);
      setError(supaError.message);
      setIsLoading(false);
    } else {
      console.log('[Login] Login successful, waiting for AuthProvider update');
    }
    // On success, the AuthProvider's listener will handle everything else.
  };

  // 1. If the AuthProvider is still checking the user's status, show a loading screen.
  React.useEffect(() => {
    console.log('[Login] useAuth state', { user, authLoading });
  }, [user, authLoading]);
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  if (user) {
    return <Navigate to="/" replace />;
  }

  // 3. If the check is complete and there is no user, show the login form.
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f3e7fe 0%, #f9c6e0 50%, #f7b267 100%)' }}>
  <div className="max-w-md w-full bg-white/95 p-8 sm:p-10 rounded-3xl shadow-2xl">

    {/* Updated Header with Logo */}
    <div className="text-center">
  <img src={ONOLogo} alt="ONO Stories Logo" className="w-24 h-24 mx-auto rounded-full shadow-lg mb-4" />
  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
    Welcome Back!
  </h1>
  <p className="text-gray-600 mt-2">Sign in to continue your adventure.</p>
</div>

    {/* Updated Form with better spacing */}
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <div className="relative -mb-3">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter your email"
            className="pl-10"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative ">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="Enter your password"
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-center text-red-600 pt-2">{error}</p>}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
    </form>

    <div className="mt-6 text-center">
      <p className="text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold underline">
          Sign up here
        </Link>
      </p>
    </div>
  </div>
</div>
  );
}