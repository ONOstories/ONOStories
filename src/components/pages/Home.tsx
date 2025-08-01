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


export function Home() {
  const navigate = useNavigate();
  return (

    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Hero Section */}
      <section className="relative px-4 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-8">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="text-purple-600 font-medium">AI-Powered Storytelling</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-6">
              Your Child's
              <br />
              Story Adventure
            </h1>
            
            <p className="text-xl text-gray-700/90 max-w-3xl mx-auto mb-8 leading-relaxed">
              Create magical, personalized storybooks where your child becomes the hero. 
              Watch their imagination come alive with AI-generated stories and beautiful illustrations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span>Start Creating</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/library")}
                className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all border-2 border-purple-200 shadow-lg"
              >
                View Sample Stories
              </button>
            </div>
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
      </section>

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