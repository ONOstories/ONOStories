import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, BookOpen, Download } from "lucide-react";
import Navbar from './Navbar';
import UsageBanner from "./UsageBanner";

interface StoryPageData {
  imageUrl: string;
  narration: string;
}
interface Story {
  id: string;
  title: string;
  pdf_url: string | null;
  storybook_data: StoryPageData[] | null;
  status: 'pending' | 'processing' | 'complete' | 'failed';
}

const StoryLibrary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isFirstLoad = true;
    let intervalId: NodeJS.Timeout | null = null;

    const loadStories = async () => {
      if (!user) return;
      try {
        const res = await fetch('/edge/list-stories', { credentials: 'include' });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || 'Could not fetch your stories.');
        setStories(j.stories ?? []);
      } catch (e: any) {
        toast.error(e.message || "Could not fetch your stories.");
        if (isFirstLoad) setStories([]); // Only clear on first load fail
      } finally {
        if (isFirstLoad) {
          setLoading(false);
          isFirstLoad = false;
        }
      }
    };

    if (user) {
      setLoading(true);
      loadStories();
      intervalId = setInterval(loadStories, 4000);
    } else {
      setLoading(false);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [user]);

  if (loading) {
    return (
      <>
        <Navbar forceSolidBackground={true} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3e7fe] via-[#f9c6e0] to-[#f7b267]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600"></p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar forceSolidBackground={true} />
      <div className="min-h-screen bg-gradient-to-br from-[#f3e7fe] via-[#f9c6e0] to-[#f7b267] pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#4C1D95] to-[#2E1065] bg-clip-text text-transparent mb-4">
              Your Story Library
            </h1>
            <p className="text-xl text-[#4C1D95]">Your personalized story collection — read, enjoy, and download anytime.</p>
          </div>
          <UsageBanner />
          {stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {stories.map((story) => {
                // Show cover only if story is complete and storybook_data is available
                const coverImage =
                  story.status === 'complete' &&
                  story.storybook_data &&
                  Array.isArray(story.storybook_data) &&
                  story.storybook_data.length > 0 &&
                  story.storybook_data[0].imageUrl
                    ? story.storybook_data[0].imageUrl
                    : null;

                return (
                  <div
                    key={story.id}
                    className="bg-white border-2 border-[#9333EA]/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-transform hover:-translate-y-2 hover:shadow-2xl"
                    style={{ minHeight: 265 }}
                  >
                    {coverImage && (
                      <div className="w-full flex justify-center mb-4">
                        <img
                          src={coverImage}
                          alt={`${story.title} cover`}
                          className="w-36 h-44 object-cover rounded-xl shadow"
                          style={{ background: '#f3e7fe' }}
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#2E1065] mb-2 truncate">{story.title}</h2>
                    </div>
                    <div className="mt-4">
                      {story.status === 'complete' ? (
                        story.storybook_data ? (
                          <Link
                            to={`/story/${story.id}`}
                            className="w-full inline-block bg-gradient-to-r from-[#9333EA] to-[#DB2777] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#9333EA]/90 transition-colors text-center flex items-center justify-center"
                          >
                            <BookOpen className="h-5 w-5 mr-2" /> Read Story
                          </Link>
                        ) : story.pdf_url ? (
                          <a
                            href={story.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-block bg-gradient-to-r from-[#4C1D95] to-[#DB2777] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#4C1D95]/90 transition-colors text-center flex items-center justify-center"
                          >
                            <Download className="h-5 w-5 mr-2" /> Download PDF
                          </a>
                        ) : null
                      ) : (
                        <div className="w-full text-center bg-[#f3e7fe] text-[#2E1065] font-bold py-3 px-4 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          <span>{story.status}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white bg-opacity-90 rounded-2xl shadow-xl mt-12">
              <h2 className="text-2xl font-extrabold text-[#2E1065] mb-2">Your library is empty!</h2>
              <p className="text-[#4C1D95] mt-2 mb-6">It's time to create your first personalized storybook.</p>
              <button
                onClick={() => navigate('/create-stories')}
                className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] text-white px-8 py-3 rounded-full text-lg font-bold shadow-md hover:from-[#7E22CE] hover:to-[#BE185D] transition-transform hover:scale-105"
              >
                Create a Story
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StoryLibrary;
