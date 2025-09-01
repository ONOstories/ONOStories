import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Adjusted import path
import { useAuth } from '../contexts/AuthProvider'; // Adjusted import path
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

    // Immediately invoke the function
    const createStory = async () => {
      try {
        setStatus('Warming up the AI storytellers...');
        const { error } = await supabase.functions.invoke('create-storybook', {
          body: { storyId },
        });
        if (error) throw error; // Throw error if invocation itself fails
        setStatus('Your story is being written and illustrated...');
      } catch (error: any) {
        console.error("Failed to invoke storybook function:", error);
        toast.error(`Error starting story creation: ${error.message}`);
        setStatus(`Oops! Something went wrong.`);
        // Redirect back to the library on failure
        setTimeout(() => navigate('/story-library'), 3000);
      }
    };

    createStory();

    // Set up the real-time listener
    const channel = supabase
      .channel(`story_update_${storyId}`)
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
          console.log('Received update:', updatedStory);
          if (updatedStory.status === 'complete') {
            toast.success('Your storybook is ready!');
            navigate('/story-library');
          } else if (updatedStory.status === 'failed') {
            toast.error('There was an issue creating your story. Please try again.');
            navigate('/story-library');
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [storyId, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col items-center justify-center text-center p-4">
      <div className="w-24 h-24 border-8 border-dashed rounded-full animate-spin border-purple-600 mb-8"></div>
      <h1 className="text-4xl font-bold text-purple-800 mb-4">
        Creating Your Magical Story...
      </h1>
      <p className="text-lg text-gray-600">{status}</p>
      <p className="text-sm text-gray-500 mt-4">Please stay on this page. You will be redirected when it's ready.</p>
    </div>
  );
};

export default StoryLoading;
