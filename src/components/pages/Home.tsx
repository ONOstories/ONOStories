"use client";
import { 
  Sparkles, 
  Star, 
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WhatMakesSpecial } from '../../components/WhatMakesSpecial.tsx';
import { HowItWorks } from '../../components/HowItWorks.tsx';
import { PlayfulCTA } from "../../components/CTA.tsx";      // path as needed
import { Footer } from "../../components/Footer.tsx";
import { Hero } from '../Hero.tsx';


export function Home() {
  const navigate = useNavigate();
  return (

    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <WhatMakesSpecial />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Happy Parents, Happy Kids
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                role: "Mother of 2",
                text: "My kids absolutely love seeing themselves as heroes in their bedtime stories. It's made reading time so much more engaging!",
                rating: 5
              },
              {
                name: "David K.",
                role: "Father of 1",
                text: "The educational stories have helped my daughter learn about kindness and sharing in such a fun way. Highly recommend!",
                rating: 5
              },
              {
                name: "Emma L.",
                role: "Mother of 3",
                text: "Creating personalized stories for each of my children has never been easier. They treasure their special books!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <PlayfulCTA  />

      {/* Footer */}
      <Footer />
    </div>
  );
}