import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import H1 from '../assets/H1.webp';
import H9 from '../assets/H9.webp';
import H11 from '../assets/H11.webp';
import H12 from '../assets/H12.webp';
import H13 from '../assets/H13.webp';

const backgroundImages = [H1,H9,H11,H12,H13];

export function Hero() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const carouselRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const runningTimeRef = useRef<HTMLDivElement>(null);

  // Guard helper: if not logged in, go to /login and remember where to return
  const goOrLogin = (targetPath: string) => {
    if (loading) return; // ignore during hydration
    if (!user) {
      navigate('/login', { state: { redirectTo: targetPath, from: location.pathname } });
    } else {
      navigate(targetPath);
    }
  };

  useEffect(() => {
    const timeRunning = 3000;
    const timeAutoNext = 7000;
    let runTimeOut: NodeJS.Timeout;
    let runNextAuto: NodeJS.Timeout;

    const showSlider = (type: 'next' | 'prev') => {
      const listEl = listRef.current;
      const carouselEl = carouselRef.current;
      if (!listEl || !carouselEl) return;
      const sliderItemsDom = listEl.querySelectorAll('.carousel .list .item');
      if (type === 'next') {
        listEl.appendChild(sliderItemsDom[0]);
        carouselEl.classList.add('next');
      } else {
        listEl.prepend(sliderItemsDom[sliderItemsDom.length - 1]);
        carouselEl.classList.add('prev');
      }
      clearTimeout(runTimeOut);
      runTimeOut = setTimeout(() => {
        carouselEl.classList.remove('next');
        carouselEl.classList.remove('prev');
      }, timeRunning);
      clearTimeout(runNextAuto);
      runNextAuto = setTimeout(() => showSlider('next'), timeAutoNext);
      const runningTimeEl = runningTimeRef.current;
      if (runningTimeEl) {
        runningTimeEl.style.animation = 'none';
        // @ts-ignore
        runningTimeEl.offsetHeight;
        runningTimeEl.style.animation = 'runningTime 7s linear 1 forwards';
      }
    };

    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');
    const handleNext = () => showSlider('next');
    const handlePrev = () => showSlider('prev');

    if (nextBtn) nextBtn.addEventListener('click', handleNext);
    if (prevBtn) prevBtn.addEventListener('click', handlePrev);

    runNextAuto = setTimeout(handleNext, timeAutoNext);

    return () => {
      clearTimeout(runTimeOut);
      clearTimeout(runNextAuto);
      if (nextBtn) nextBtn.removeEventListener('click', handleNext);
      if (prevBtn) prevBtn.removeEventListener('click', handlePrev);
    };
  }, []);

  return (
    <section className="relative h-screen w-full">
      <div className="carousel" ref={carouselRef}>
        <div className="list" ref={listRef}>
          {backgroundImages.map((imgUrl, index) => (
            <div className="item" key={index} style={{ backgroundImage: `url('${imgUrl}')` }} />
          ))}
        </div>
        <div className="arrows">
          <button className="prev">{'<'}</button>
          <button className="next">{'>'}</button>
        </div>
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
