// src/pages/Home.tsx

"use client";
import { useNavigate } from 'react-router-dom';
import { WhatMakesSpecial } from '../../components/WhatMakesSpecial';
import { HowItWorks } from '../../components/HowItWorks';
import { PlayfulCTA } from '../../components/CTA';
import { Footer } from '../../components/Footer';
import { Hero } from '../../components/Hero'; // Corrected path assuming Hero is in components
import Navbar from '../../components/Navbar'; // Corrected path assuming Navbar is in components
import { Testimonials } from '../../components/testimonials'; // 1. Import the new component

export function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <WhatMakesSpecial />

      {/* How It Works */}
      <HowItWorks />

      {/* CTA Section */}
      <PlayfulCTA />

      {/* Testimonials */}
      <Testimonials /> {/* 2. Use the new component here */}

      {/* Footer */}
      <Footer />
    </div>
  );
}