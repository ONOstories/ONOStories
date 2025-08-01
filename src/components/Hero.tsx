// --- Hero Section ----------------------------------------------------------
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative px-4 py-20 overflow-hidden bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {/*  Banner chip */}
        <div className="text-center">
          {/*  Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2E1065] mb-6">
            Your Child&apos;s
            <br className="hidden sm:block" />
            Story Adventure
          </h1>

          {/*  Sub-headline */}
          <p className="text-lg md:text-xl leading-8 text-[#4C1D95]/90 max-w-3xl mx-auto mb-12">
            Create magical, personalized storybooks where your child becomes the hero.
            Watch their imagination come alive with AI-generated stories and beautiful illustrations.
          </p>

          {/*  CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] text-white px-8 py-4 rounded-full text-base md:text-lg font-semibold hover:from-[#7E22CE] hover:to-[#BE185D] transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => navigate('/library')}
              className="bg-white text-[#9333EA] px-8 py-4 rounded-full text-base md:text-lg font-semibold hover:bg-[#F5F3FF] transition-all border-2 border-[#E9D5FF] shadow-lg"
            >
              View Sample Stories
            </button>
          </div>
        </div>
                {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"></div>
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-30"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce delay-700">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-25"></div>
        </div>
        
      </div>
    </section>
  );
}
