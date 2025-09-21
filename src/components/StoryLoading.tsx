// src/components/StoryLoading.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'sonner';

const StoryLoading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState('Starting the magic...');
  const storyId = location.state?.storyId;

  useEffect(() => {
    if (!storyId || !user) {
      toast.error('Could not find the story to create. Returning to library.');
      navigate('/story-library');
      return;
    }

    let stop = false;
    const poll = async () => {
      try {
        setStatus('Your story is being written and illustrated...');
        const res = await fetch(`/edge/story-status?storyId=${encodeURIComponent(storyId)}`, {
          credentials: 'include', // send HttpOnly cookies
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Status check failed');
        if (data.status === 'complete') {
          toast.success('Your storybook is ready!');
          navigate('/story-library');
          return;
        }
        if (data.status === 'failed') {
          toast.error('There was an issue creating your story. Please try again.');
          navigate('/story-library');
          return;
        }
      } catch (e: any) {
        console.error('Status poll error:', e);
      }
      if (!stop) setTimeout(poll, 2000); // 2s interval
    };

    // kick off the AI generation (unchanged)
    (async () => {
      try {
        setStatus('Warming up the AI storytellers...');
        const res = await fetch('/edge/create-storybook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ storyId }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Failed to start');
        }
        poll();
      } catch (err: any) {
        console.error('Failed to invoke storybook function:', err);
        toast.error(`Error starting story creation: ${err.message}`);
        setTimeout(() => navigate('/story-library'), 3000);
      }
    })();

    return () => { stop = true; };
  }, [storyId, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col items-center justify-center text-center p-4">
      <div className="w-24 h-24 border-8 border-dashed rounded-full animate-spin border-purple-600 mb-8"></div>
      <h1 className="text-4xl font-bold text-purple-800 mb-4">Creating Your Magical Story...</h1>
      <p className="text-lg text-gray-600">{status}</p>
      <p className="text-sm text-gray-500 mt-4">Please stay on this page. You will be redirected when it's ready.</p>
    </div>
  );
};

export default StoryLoading;
