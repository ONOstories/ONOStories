import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import H1 from '../assets/first.webp';
import H9 from '../assets/second.webp';
import H11 from '../assets/third.webp';
import H12 from '../assets/fourth.webp';
import H13 from '../assets/fifth.webp';

const backgroundImages = [H1, H9, H11, H12, H13];

export function Hero() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Guard helper
  const goOrLogin = (targetPath: string) => {
    if (loading) return;
    if (!user) {
      navigate('/login', { state: { redirectTo: targetPath, from: location.pathname } });
    } else {
      navigate(targetPath);
    }
  };

  // Auto slide
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveIndex(i => (i + 1) % backgroundImages.length);
    }, 7000);
    return () => clearTimeout(timeoutRef.current);
  }, [activeIndex]);

  const handlePrev = () => setActiveIndex(i => (i - 1 + backgroundImages.length) % backgroundImages.length);
  const handleNext = () => setActiveIndex(i => (i + 1) % backgroundImages.length);

  return (
    <section className="relative h-screen w-full">
      <div className="carousel">
        <div className="list">
          {backgroundImages.map((imgUrl, index) => (
            <div
              className="item"
              key={index}
              style={{
                opacity: index === activeIndex ? 1 : 0,
                zIndex: index === activeIndex ? 2 : 1,
                transition: 'opacity 1s'
              }}
            >
              {/* Always load all images, let browser handle lazy-loading */}
              <img
                src={imgUrl}
                alt=""
                loading="lazy"
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              />
            </div>
          ))}
        </div>
        {/* <div className="arrows">
          <button className="prev" aria-label="Previous Image" onClick={handlePrev}>
            {'<'}
          </button>
          <button className="next" aria-label="Next Image" onClick={handleNext}>
            {'>'}
          </button>
        </div> */}
      </div>
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-4">
        <h1 className="mt-8 mb-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
          ONO Stories
        </h1>
        <p className="mx-auto mb-12 max-w-3xl text-lg leading-8 text-gray-200 md:text-xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
          Create magical, personalized storybooks where your child becomes the hero. Watch their imagination come alive with AI-generated stories and beautiful illustrations.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => goOrLogin('/create-stories')}
            className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-[#9333EA] to-[#DB2777] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-[#7E22CE] hover:to-[#BE185D] md:text-lg"
          >
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => goOrLogin('/story-library')}
            className="rounded-full border-2 border-white/50 bg-white/10 px-8 py-4 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20 md:text-lg"
          >
            View Sample Stories
          </button>
        </div>
      </div>
    </section>
  );
}
