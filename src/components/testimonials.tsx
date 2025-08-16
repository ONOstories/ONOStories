// src/components/Testimonials.tsx

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

// This is the updated data
const testimonialsData = [
  {
    name: 'Minakshi M.',
    role: 'Parent',
    text: "Ryan really loved seeing himself as the astronaut, thank you for bringing the happiness.",
    rating: 5,
  },
  {
    name: 'Parag R.',
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

  useEffect(() => {
    const delay = 150 * index; // Staggered animation
    const timer = setTimeout(() => setIsAppearing(true), delay);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className="card"
      style={{
        opacity: isAppearing ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      <div className="card__surface">
        <div className="card__container">
          <div className="card__content">
            <div className="card__header">
              <h2 className="card__title">{name}</h2>
              <div className="card__badge">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="card__description">“{text}”</p>
            <div className="card__author-info">
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
      <main className="testimonials-container" style={{ background: 'transparent' }}>
        {testimonialsData.map((testimonial, i) => (
          <TestimonialCard key={i} index={i} {...testimonial} />
        ))}
      </main>
    </section>
  );
}