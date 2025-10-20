import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, PartyPopper } from 'lucide-react';
import ONOLogo from '../../assets/ONOstories_logo.png';

export function EmailConfirmed() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // This timer will count down every second.
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          // When the timer is done, redirect to the homepage.
          // Supabase's auth provider will automatically handle the user's logged-in state.
          navigate('/');
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    // This is a cleanup function to clear the interval if the user navigates away manually.
    return () => clearInterval(timer);
  }, [navigate]);

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
            Email Verified!
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome to the ONOSTORIES family! Get ready to create magical adventures.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-3 p-3 bg-green-100 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <span className="text-gray-700 font-semibold">
              Your email is now confirmed.
            </span>
          </div>

          <div className="mt-4 flex items-center space-x-2 rounded-full bg-gray-100 px-4 py-2">
            <PartyPopper className="h-6 w-6 text-purple-600" />
            <p className="font-semibold text-gray-600">
              Redirecting you in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}