import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthProvider";
import { toast } from "sonner";

interface Story {
  id: string;
  title: string;
  pdf_url: string | null;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  photo_url: string; // Add the photo_url to the interface
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
      .select('id, title, pdf_url, status, photo_url') // Select the photo_url as well
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

  // Real-time listener for story updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`stories-${user.id}`);

    channel
      .on(
        'broadcast',
        { event: 'story-complete' },
        (response) => {
          console.log('Broadcast received!', response);
          const completedStory = response.payload.story as Story;
          toast.success(`Your story "${completedStory.title}" is ready!`);
          setStories((currentStories) =>
            currentStories.map((story) =>
              story.id === completedStory.id ? completedStory : story
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return <div className="text-center py-10">Loading your magical stories...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Story Library</h1>
      
      {stories.length === 0 ? (
        <div className="text-center text-gray-500">You haven't created any stories yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
              <img src={story.photo_url} alt={story.title} className="w-full h-48 object-cover" />
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex-grow">{story.title}</h2>
                <div className="mt-auto">
                  {story.status === 'complete' && story.pdf_url ? (
                    <a
                      href={story.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Download PDF
                    </a>
                  ) : (
                    <div className="w-full text-center bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold capitalize">
                      {story.status}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryLibrary;
