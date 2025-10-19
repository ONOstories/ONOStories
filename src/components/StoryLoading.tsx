import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    const stageDuration = 25000; // 20 seconds per stage

    // Progress bar for each stage (fills from 0 to 100)
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (100 / (stageDuration / 200));
      });
    }, 200);

    // Advance to next stage
    const stageTimeout = setTimeout(() => {
      if (currentStage < stages.length - 1) {
        setCurrentStage(prev => prev + 1);
      } else {
        clearInterval(progressInterval);
        setTimeout(() => navigate("/story-library"), 1500);
      }
    }, stageDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimeout);
    };
  }, [currentStage, navigate]);

  const activeStage = stages[currentStage];

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f3e7fe] via-[#f9c6e0] to-[#f7b267] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20">
        <Navbar />
      </div>
      
      {/* Card perfectly centered */}
      <div className="w-full max-w-2xl mx-auto p-6 md:p-10 relative z-10">
        <div className="flex justify-center">
          <div className="relative w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem] mx-auto">
            <DotLottieReact
              src="https://lottie.host/98b7243b-8e7d-4c1f-a3bc-0c6d570d71dd/6NemHSKYix.lottie"
              loop
              autoplay
            />
          </div>
        </div>

        <div className="text-center mb-8 -mt-16">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#4C1D95] to-[#2E1065] bg-clip-text text-transparent mb-2">
            {activeStage.title}
          </h2>
          <p className="text-base bg-gradient-to-r from-[#4C1D95] to-[#2E1065] bg-clip-text text-transparent max-w-md mx-auto">
            {activeStage.description}
          </p>
        </div>

        <div className="px-4">
          <progress value={progress} max="100" className="w-full h-4 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-purple-600" />
          <div className="flex justify-between items-start mt-3">
            {stages.map((s, index) => (
              <div key={s.id} className="flex flex-col items-center text-center w-1/4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
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
    </div>
  );
};

export default StoryLoading;
