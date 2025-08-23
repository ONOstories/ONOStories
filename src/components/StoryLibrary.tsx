import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Story {
  id: string;
  title: string;
  pdf_url: string | null;
  status: 'pending' | 'processing' | 'complete' | 'failed';
}

const StoryLibrary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, pdf_url, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Could not fetch your stories.");
    } else {
      setStories(data as Story[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`stories_user_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchStories();
          if (payload.eventType === 'UPDATE' && payload.new.status === 'complete' && payload.old.status !== 'complete') {
             toast.success(`Your story "${(payload.new as Story).title}" is ready!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading your magical library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
                Your Story Library
            </h1>
            <p className="text-xl text-gray-600">
                All your created adventures, ready to be downloaded and shared.
            </p>
        </div>
      
        {stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <div key={story.id} className="bg-white border rounded-2xl p-6 shadow-lg flex flex-col justify-between transition-transform transform hover:-translate-y-2">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{story.title}</h2>
                <div className="mt-4">
                  {story.status === 'complete' && story.pdf_url ? (
                    <a
                      href={story.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center inline-block bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Download Story
                    </a>
                  ) : (
                    <div className="w-full text-center bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Status: {story.status}...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
             <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700">Your library is empty!</h2>
                <p className="text-gray-500 mt-2 mb-6">It's time to create your first personalized storybook.</p>
                <button
                    onClick={() => navigate('/create-stories')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-transform hover:scale-105"
                >
                    Create a Story
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default StoryLibrary;