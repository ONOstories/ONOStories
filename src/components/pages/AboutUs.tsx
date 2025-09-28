// src/components/pages/AboutUs.tsx
import { Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import { Footer } from '../Footer';
import logo from '../../assets/ONOstories_logo.jpg';
import rohitImage from '../../assets/Rohit_Raut.jpg';

// X (Twitter) SVG icon, minimal and bold for "X"
function XLogo({ size = 20 }) {
  return (
    <svg height={size} width={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="7" fill="black" />
      <path
        d="M23.233 19.101 32 8h-2.047l-7.564 9.299L15.05 8H8l9.062 13.185L8 32h2.048l8.05-9.902L24.95 32H32L23.233 19.101Zm-2.86 3.518-1.149-1.639L10.754 9.304h3.405l6.057 8.637 1.148 1.639 9.278 13.676h-3.405l-6.056-8.637Z"
        fill="white"
      />
    </svg>
  );
}

export function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3e7fe] via-[#f9c6e0] to-[#f7b267] flex flex-col font-main">
      <Navbar forceSolidBackground={true} />
      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-16">
          <img src={logo} alt="ONO Stories Logo" className="w-32 h-32 rounded-full mt-8 mb-6 border-4 border-white shadow-lg justify-center" />
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#4C1D95] to-[#2E1065] bg-clip-text text-transparent mb-6">
            AI Edutainment Platform for Kids
          </h1>
          <p className="text-xl text-[#4C1D95] max-w-xl mx-auto mb-2">
            At ONO Stories, we craft personalized journeys where your child is the hero, transforming learning into a magical adventure.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16 relative bg-white rounded-2xl shadow-xl p-10 text-center">
          <h2 className="text-3xl font-extrabold mb-4 text-[#9333EA]">Our Mission</h2>
          <p className="text-lg text-[#4C1D95] mb-7 max-w-2xl mx-auto">
            We’re on a quest to make learning effortless and joyful through stories that feel personal. We focus on value-driven storytelling where kids don’t just watch—they become part of the narrative.
          </p>
          <div className="flex flex-wrap justify-center gap-4 my-4">
            <span className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] text-white font-semibold py-2 px-6 rounded-full shadow">
              Bedtime Stories
            </span>
            <span className="bg-gradient-to-r from-[#DB2777] to-[#F7B267] text-white font-semibold py-2 px-6 rounded-full shadow">
              Moral Value Stories
            </span>
            <span className="bg-gradient-to-r from-[#F7B267] to-[#9333EA] text-white font-semibold py-2 px-6 rounded-full shadow">
              Educational Stories
            </span>
          </div>
        </section>

        {/* Why We Started Section */}
        <section className="mb-16 bg-white rounded-2xl shadow-xl p-10 text-center">
          <h2 className="text-3xl font-extrabold mb-4 text-transparent bg-gradient-to-r from-[#F7B267] to-[#DB2777] bg-clip-text">
            Why We Started
          </h2>
          <p className="text-lg text-[#4C1D95] mb-3">
            As a child, I’d gaze at the night sky, my head filled with questions: "What’s out there? How do stars shine?" My curiosity often drifted away, unanswered.
          </p>
          <p className="text-lg text-[#4C1D95] mb-3">
            Today, AI gives us the power to answer those questions in the most vivid way possible. We built ONO Stories to be the bridge between a child's wonder and the universe of knowledge.
          </p>
          <p className="text-lg text-[#4C1D95] mb-1">
            We transform their "what ifs" into vibrant, living stories. Whether it’s about stars, kindness, or the mysteries of science, your child's curiosity becomes their greatest teacher. Imagination is no longer just a thought—it's an experience.
          </p>
        </section>

        {/* Meet the Founder Section */}
        <section className="mb-12 flex flex-col md:flex-row items-center bg-white p-6 md:p-0 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex-1 flex-shrink-0">
            <img src={rohitImage} alt="Rohit - Founder of ONO Stories" className="w-full h-full object-cover md:rounded-none rounded-2xl md:h-[500px]" />
          </div>
          <div className="flex-1 p-8 md:p-16">
            <h2 className="text-3xl font-bold mb-2 text-[#9333EA]">Meet the Founder</h2>
            <h3 className="text-2xl font-semibold mb-3 text-[#4C1D95]">Meet Rohit</h3>
            <p className="text-lg text-[#4C1D95] mb-6">
              Hi, I’m Rohit, a 22-year-old on a mission to provide real value to society. When I’m not building ONO Stories, I love to dance and paint. My vision is simple: to empower the next generation with stories that make them wiser, kinder, and more imaginative.
            </p>
            <div className="flex gap-4 mb-2">
              <a
                href="https://x.com/Rohit_Raut1"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 hover:brightness-110 shadow transition"
              >
                <XLogo size={20} />
                X
              </a>
              <a
                href="https://www.linkedin.com/in/rohitraut01/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0A66C2] text-white px-4 py-2 rounded-full flex items-center gap-2 hover:brightness-110 shadow transition"
              >
                <Linkedin size={20} />
                LinkedIn
              </a>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-[#9333EA] to-[#DB2777] text-white rounded-full px-8 py-4 font-bold text-lg shadow-lg hover:scale-105 transition"
          >
            Explore Stories
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
