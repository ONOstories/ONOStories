// src/components/Testimonials.tsx
import { useEffect, useState, useRef, MouseEvent } from 'react';
import { Star } from 'lucide-react';

const testimonialsData = [
  {
    name: 'Aavani',
    role: 'Parent',
    text: "Ryan really loved seeing himself as the astronaut, thank you for bringing the happiness.",
    rating: 5,
  },
  {
    name: 'Karthik',
    role: 'Parent',
    text: "The personalisation is actually expanding the imagination, my son made himself the superhero in his own universe.",
    rating: 5,
  },
  {
    name: 'Tracy K.',
    role: 'Parent',
    text: "My daughter Emily made her first storybook today, where she is helping her friends and other people. Made me cry. Ono stories is truly the best Birthday gift.",
    rating: 5,
  },
];

type TestimonialCardProps = {
  name: string;
  role: string;
  text: string;
  rating: number;
  index: number;
};

const TestimonialCard = ({ name, role, text, rating, index }: TestimonialCardProps) => {
  const [isAppearing, setIsAppearing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // State for the dynamic transform and transition styles
  const [cardStyle, setCardStyle] = useState({});

  useEffect(() => {
    const delay = 150 * index; // Staggered animation for initial load
    const timer = setTimeout(() => setIsAppearing(true), delay);
    return () => clearTimeout(timer);
  }, [index]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Calculate rotation based on cursor position; max rotation of 8 degrees
    const rotateX = -((y - height / 2) / (height / 2)) * 8;
    const rotateY = ((x - width / 2) / (width / 2)) * 8;

    setCardStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'transform 0.1s ease-out', // Fast transition for responsiveness
    });
  };

  const handleMouseLeave = () => {
    setCardStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)', // Smooth transition on exit
    });
  };

  return (
    <div
      ref={cardRef}
      className="card h-full flex"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...cardStyle,
        opacity: isAppearing ? 1 : 0,
        transition: `${(cardStyle as any).transition || 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)'}, opacity 0.5s ease-in-out`,
      }}
    >
      <div className="card__surface flex flex-col h-full">
        <div className="card__container flex flex-col h-full">
          <div className="card__content flex flex-col h-full">
            <div className="card__header">
              <h2 className="card__title">{name}</h2>
              <div className="card__badge">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="card__description flex-1">“{text}”</p>
            <div className="card__author-info mt-auto">
              <p className="card__author">{name}</p>
              <p className="card__role">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#FFF7ED] to-[#FFE9F3]">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#2E1065] sm:text-5xl">
          Happy Parents, Happy Kids
        </h2>
      </div>
      <main
        className="testimonials-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        style={{ background: 'transparent' }}
      >
        {testimonialsData.map((testimonial, i) => (
          <TestimonialCard key={i} index={i} {...testimonial} />
        ))}
      </main>
    </section>
  );
}