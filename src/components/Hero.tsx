// src/components/Hero.tsx

import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import newHeroImage from '../assets/Hero_bg1.png';
import newHeroImage2 from '../assets/Hero_bg2.png';
import newHeroImage3 from '../assets/Hero_bg3.png';
import newHeroImage4 from '../assets/Hero_bg4.png';
import newHeroImage5 from '../assets/Hero_bg5.png';

// Array of background images for the carousel
const backgroundImages = [
  newHeroImage,
  newHeroImage2,
  newHeroImage3,
  newHeroImage4,
  newHeroImage5
];

export function Hero() {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const runningTimeRef = useRef<HTMLDivElement>(null);

  // This useEffect contains the JavaScript logic to run the carousel animation
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
      runNextAuto = setTimeout(() => {
        showSlider('next');
      }, timeAutoNext);

      resetTimeAnimation();
    };

    const resetTimeAnimation = () => {
      const runningTimeEl = runningTimeRef.current;
      if (runningTimeEl) {
        runningTimeEl.style.animation = 'none';
        runningTimeEl.offsetHeight; // trigger reflow
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

    // Cleanup function to remove listeners and timeouts
    return () => {
      clearTimeout(runTimeOut);
      clearTimeout(runNextAuto);
      if (nextBtn) nextBtn.removeEventListener('click', handleNext);
      if (prevBtn) prevBtn.removeEventListener('click', handlePrev);
    };
  }, []);

  return (
    <section className="relative h-screen w-full">
      {/* Carousel Background */}
      <div className="carousel" ref={carouselRef}>
        <div className="list" ref={listRef}>
          {backgroundImages.map((imgUrl, index) => (
            <div
              className="item"
              key={index}
              style={{ backgroundImage: `url('${imgUrl}')` }}
            />
          ))}
        </div>
        <div className="arrows">
          <button className="prev">{'<'}</button>
          <button className="next">{'>'}</button>
        </div>
        {/* <div className="timeRunning" ref={runningTimeRef}></div> */}
      </div>

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Original Hero Content Layered on Top */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-4">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
          Your Child's<br className="hidden sm:block" /> Story Adventure
        </h1>

        <p className="mx-auto mb-12 max-w-3xl text-lg leading-8 text-gray-200 md:text-xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
          Create magical, personalized storybooks where your child becomes the hero.
          Watch their imagination come alive with AI-generated stories and beautiful illustrations.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigate('/create-stories')}
            className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-[#9333EA] to-[#DB2777] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-[#7E22CE] hover:to-[#BE185D] md:text-lg"
          >
            <span>Get Started</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => navigate('/story-library')}
            className="rounded-full border-2 border-white/50 bg-white/10 px-8 py-4 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20 md:text-lg"
          >
            View Sample Stories
          </button>
        </div>
      </div>
    </section>
  );
}