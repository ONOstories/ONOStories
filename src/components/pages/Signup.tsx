
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserSquare } from 'lucide-react';
import ONOLogo from '../../assets/ONOstories_logo.jpg';
import { supabase } from '../../lib/supabaseClient';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', gender: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (!formData.gender) {
      setError('Please select a gender.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const { error: supaError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.fullName,
          gender: formData.gender
        },
        emailRedirectTo: `${window.location.origin}/email-confirmed`,
      },
    });

    if (supaError) {
      setError(supaError.message);
    } else {
      setMessage('Signup successful! Please check your email to confirm your account.');
      setFormData({ fullName: '', email: '', password: '', confirmPassword: '', gender: '' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #f3e7fe 0%, #f9c6e0 50%, #f7b267 100%)' }}>
  <div className="max-w-md w-full bg-white/95 p-8 sm:p-10 rounded-3xl shadow-2xl">

    {/* Updated Header with Logo */}
    <div className="text-center">
  <img src={ONOLogo} alt="ONO Stories Logo" className="w-24 h-24 mx-auto rounded-full shadow-lg mb-4" />
  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
    Create Your Account
  </h1>
  <p className="text-gray-600 mt-2">Join ONO Stories and start creating magic!</p>
</div>

    {/* Updated Form with better spacing */}
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative -mb-3">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required minLength={2} placeholder="Enter your full name" className="pl-10" />
        </div>
      </div>

<div>
  <Label htmlFor="gender">Gender</Label>
  <div className="relative mt-1 -mb-3">
    <UserSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
    <select
      id="gender"
      name="gender"
      value={formData.gender}
      onChange={handleInputChange}
      required
      className={
        "pl-10 flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm " +
        (formData.gender
          ? "bg-[#E8F0FE] text-black border-black"
          : "bg-neutral-900 text-neutral-400 placeholder:text-neutral-400") +
        " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      }
    >
      <option value="" disabled>Select your gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>
  </div>
</div>


      <div>
        <Label htmlFor="email">Email Address</Label>
        <div className="relative -mb-3">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Enter your email" className="pl-10" />
        </div>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative -mb-3">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleInputChange} required minLength={6} placeholder="Create a password (min 6 characters)" className="pl-10 pr-10" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative mb-3 ">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required minLength={6} placeholder="Confirm your password" className="pl-10 pr-10" />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}
      {message && <p className="text-sm text-green-600 text-center pt-2">{message}</p>}
      <button type="submit" disabled={isLoading} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50">
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>

    <div className="mt-6 text-center">
      <p className="text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold underline">
          Sign in here
        </Link>
      </p>
    </div>
  </div>
</div>
  );
}