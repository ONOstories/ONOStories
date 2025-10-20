import { useEffect, useState, useRef } from "react";
import Navbar from '../components/Navbar';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'sonner';

// --- Stage Data ---
interface Stage {
  id: number;
  title: string;
  description: string;
}

const stages: Stage[] = [
  {
    id: 1,
    title: "Crafting Your Story",
    description: "Weaving the foundation of your story, choosing the perfect beginning for your journey!",
  },
  {
    id: 2,
    title: "Adding Personal Touches",
    description: "Making this story uniquely yours! Adding your child's name and special details just for them!",
  },
  {
    id: 3,
    title: "Illustrating the Story",
    description: "Watch the magic happen as beautiful pictures come to life! Painting every page with care!",
  },
  {
    id: 4,
    title: "Bringing it All to Life",
    description: "Almost ready! Adding the final sparkles and magic dust. Your amazing adventure is about to begin!",
  },
];

export const StoryLoading = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Starting the magic...");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const storyId = location.state?.storyId;
  const stopRef = useRef(false);

  // Safe clear for intervals and timeouts
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Progress animation per stage, but instantly jumps to completion if backend is ready.
  useEffect(() => {
    setProgress(0);
    const stageDuration = 25000;
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => prev >= 100 ? 100 : prev + (100 / (stageDuration / 200)));
    }, 200);

    stageTimeoutRef.current = setTimeout(() => {
      setProgress(0);
      setCurrentStage(cs => (cs < stages.length - 1 ? cs + 1 : cs));
    }, stageDuration);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current);
    };
  }, [currentStage]);

  useEffect(() => {
    if (!storyId || !user) {
      toast.error('Could not find the story to create. Returning to library.');
      navigate('/story-library');
      return;
    }

    stopRef.current = false;

    // --- Backend polling logic ---
    const pollStatus = async () => {
      try {
        setStatusText('Your story is being written and illustrated...');
        const res = await fetch(`/edge/story-status?storyId=${encodeURIComponent(storyId)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Status check failed');
        if (data.status === 'complete') {
          // force the UI to final stage and fill bar for instant redirect experience:
          setCurrentStage(stages.length - 1);
          setProgress(100);
          toast.success('Your storybook is ready!');
          setTimeout(() => navigate('/story-library'), 1500);
          stopRef.current = true;
          return;
        }
        if (data.status === 'failed') {
          toast.error('There was an issue creating your story. Please try again.');
          stopRef.current = true;
          navigate('/story-library');
          return;
        }
      } catch (e: any) {
        // Silent retry, show error only if polling fails repeatedly
        console.error('Status poll error:', e);
      }
      if (!stopRef.current) setTimeout(pollStatus, 2000);
    };

    // --- Start storybook generation if at step 0 (user just arrived on page) ---
    (async () => {
      try {
        setStatusText('Please keep this page open, you’ll be redirected as soon as your story is ready.');
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
        pollStatus();
      } catch (err: any) {
        toast.error(`Error starting story creation: ${err.message}`);
        setTimeout(() => navigate('/story-library'), 3000);
      }
    })();

    return () => { stopRef.current = true; };
    // eslint-disable-next-line
  }, [storyId, user, navigate]);

  const activeStage = stages[currentStage];

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f3e7fe] via-[#f9c6e0] to-[#f7b267] px-1 sm:px-4 pb-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20">
        <Navbar />
      </div>
        <div className="flex justify-center">
          <div className="relative w-full min-w-[12rem] max-w-[19rem] sm:max-w-[22rem] md:max-w-[28rem] aspect-square mx-auto">
            <DotLottieReact
              src="https://lottie.host/98b7243b-8e7d-4c1f-a3bc-0c6d570d71dd/6NemHSKYix.lottie"
              loop
              autoplay
            />
          </div>
        </div>
        <div className="text-center mb-6 sm:mb-8 -mt-10 sm:-mt-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#4C1D95] to-[#2E1065] bg-clip-text text-transparent mb-2">
            {activeStage.title}
          </h2>
          <p className="text-sm sm:text-base bg-gradient-to-r from-[#4C1D95] to-[#2E1065] bg-clip-text text-transparent max-w-[95vw] sm:max-w-md mx-auto">
            {activeStage.description}
          </p>
          <p className="text-xs sm:text-base text-gray-500 mt-3 sm:mt-6">{statusText}</p>
        </div>
        <div className="px-1 sm:px-4">
          <progress value={progress} max="100" className="w-full h-3 sm:h-4 rounded-lg [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-purple-600" />
          <div className="flex justify-between items-start mt-2 sm:mt-3">
            {stages.map((s, index) => (
              <div key={s.id} className="flex flex-col items-center text-center w-1/4">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                    index < currentStage
                      ? "bg-green-400 text-white"
                      : index === currentStage
                      ? "bg-purple-600 text-white scale-110 shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < currentStage ? "✓" : s.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      
    </div>
  );
};

export default StoryLoading;