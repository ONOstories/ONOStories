import { AnimatedTestimonials } from './ui/animated-testimonials';
import personalizedImg from "/Personalized.png";
import aiPoweredImg from "/Ai powered.webp";
import safeAndEducationalImg from "/Safe and educational.webp";
/**
 * Pastel-gradient block that explains why ONOSTORIES stands out.
 * Drop this anywhere in your page tree.
 */
export function WhatMakesSpecial() {
  return (
    <section className="py-12 bg-gradient-to-br from-[#FFF7ED] to-[#FFE9F3]">
      <div className="max-w-7xl mx-auto">
        {/* ----------  HEADLINE  ---------- */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2E1065]">
            What Makes Our Stories Special?
          </h2>

          <p className="mt-4 text-xl leading-8 text-[#4C1D95] max-w-2xl mx-auto">
            Every story is uniquely crafted to engage your child's imagination and create lasting memories.
          </p>
        </div>

        {/* ----------  TESTIMONIALS  ---------- */}
        <AnimatedTestimonials
          autoplay
          testimonials={[
            {
              name: 'Personalized Stories',
              designation: '',
              quote:
                'Your child becomes the main character in every adventure, with stories tailored to their interests and personality.',
              src: personalizedImg,
            },
            {
              name: 'AI-Powered Magic',
              designation: '',
              quote:
                "Advanced AI creates unique stories and stunning illustrations that bring your child's adventures to life.",
              src: aiPoweredImg,
            },
            {
              name: 'Safe & Educational',
              designation: '',
              quote:
                'All content is child-friendly and designed to promote learning, creativity, and positive values.',
              src: safeAndEducationalImg,
            },
          ]}
        />
      </div>
    </section>
  );
}
