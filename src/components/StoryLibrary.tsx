// src/components/StoryLibrary.tsx

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthProvider";
import { toast } from "sonner";

interface Story {
  id: string;
  title: string;
  pdf_url: string | null;
  status: 'pending' | 'processing' | 'complete' | 'failed';
}

const StoryLibrary = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch stories from the database
  const fetchStories = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, pdf_url, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching stories:", error);
      toast.error("Could not fetch your stories.");
    } else {
      setStories(data as Story[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, [user]);









  // --- UPDATED REAL-TIME LISTENER ---
  useEffect(() => {
    if (!user) return;






    // Listen on a channel specific to the logged-in user
    const channel = supabase.channel(`stories-${user.id}`);











































    channel
      .on(
        'broadcast',
        { event: 'story-complete' }, // Listen for our custom event
        (response) => {
          console.log('Broadcast received!', response);
          const completedStory = response.payload.story as Story;


          // Show a notification
          toast.success(`Your story "${completedStory.title}" is ready!`);

          // Update the local state to reflect the change
          setStories((currentStories) =>
            currentStories.map((story) =>
              story.id === completedStory.id ? completedStory : story
            )
          );
        }
      )
      .subscribe();

    // Cleanup function to remove the channel subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return <div className="text-center py-10">Loading your magical stories...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Story Library</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div key={story.id} className="border rounded-lg p-4 shadow-lg flex flex-col justify-between">
            <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
            <div>
              {story.status === 'complete' && story.pdf_url ? (
                <a
                  href={story.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Download PDF
                </a>
              ) : (
                <div className="w-full text-center bg-gray-300 text-gray-600 py-2 px-4 rounded-md">
                  Status: {story.status}...
                </div>
              )}












            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryLibrary;