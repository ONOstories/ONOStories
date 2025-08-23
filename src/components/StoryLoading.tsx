import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
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
      toast.error('Could not find the story to create.');
      navigate('/create-stories');
      return;
    }

    const createStory = async () => {
      try {
        setStatus('Warming up the AI storytellers...');
        await supabase.functions.invoke('create-storybook', {
          body: { storyId },
        });
        setStatus('Illustrations are being painted...');
      } catch (error: any) {
        toast.error(`Failed to start story creation: ${error.message}`);
        setStatus(`Oops! Something went wrong.`);
        setTimeout(() => navigate('/create-stories'), 3000);
      }
    };

    createStory();

    const channel = supabase.channel(`story_update_${storyId}`);
    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stories',
          filter: `id=eq.${storyId}`,
        },
        (payload) => {
          const updatedStory = payload.new as { status: string };
          if (updatedStory.status === 'complete') {
            toast.success('Your storybook is ready!');
            navigate('/story-library');
          } else if (updatedStory.status === 'failed') {
            toast.error('There was an issue creating your story.');
            navigate('/story-library');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [storyId, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col items-center justify-center text-center p-4">
      <div className="w-24 h-24 border-8 border-dashed rounded-full animate-spin border-purple-600 mb-8"></div>
      <h1 className="text-4xl font-bold text-purple-800 mb-4">
        Creating Your Story...
      </h1>
      <p className="text-lg text-gray-600">{status}</p>
    </div>
  );
};

export default StoryLoading;