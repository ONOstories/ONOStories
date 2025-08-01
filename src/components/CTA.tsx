"use client";
import { Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* Pastel CTA without stars ─ matches the WhatMakesSpecial palette */
export function PlayfulCTA() {
  const navigate = useNavigate();
  return (
    
    <section className="relative overflow-hidden py-24 px-4">
      {/* shared peach-to-pink gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF7ED] via-rose-200 to-[#FFE9F3]" />

      {/* floating décor */}
      <Decorations />

      {/* copy + button */}
      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#2E1065] mb-6 drop-shadow-sm">
          Ready to Create Your Child&apos;s First Story?
        </h2>

        <p className="text-xl text-[#4C1D95]/90 mb-10">
          Join thousands of parents making magical memories through personalized storytelling.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-[#4C1D95] px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-[#FFF7ED] active:scale-95 transition"
        >
          Get Started Today
        </button>
      </div>
    </section>
  );
}

/* — fun but subtle decorations — */
function Decorations() {
  return (
    <>
      {/* drifting cloud */}
      <div className="absolute -top-24 left-1/4 w-64 h-32 bg-white/60 rounded-full blur-2xl animate-cloud" />
      {/* rainbow arch */}
      <div className="absolute -bottom-16 right-1/4 w-96 h-96 rounded-full border-[28px] border-transparent
                      border-t-rose-300 border-l-blue-300 border-r-emerald-300 rotate-45" />

      
<style>{`
  /*  ➜ cloud now glides right, pauses, then returns left
        for a soft “floating” feel */
  @keyframes cloud {
    0%,100% { transform: translateX(0); }
    50%     { transform: translateX(240px); }
  }
  .animate-cloud { animation: cloud 90s ease-in-out infinite; }

  /* keep these as-is */
  @keyframes plane { 0% {transform: translate(-60px,0);} 100% {transform: translate(380px,-130px);} }
  @keyframes book  { 0%,100% {transform: translateY(0) rotate(6deg);} 50% {transform: translateY(-18px) rotate(-6deg);} }
  .animate-plane { animation: plane 15s linear infinite; }
  .animate-book  { animation: book 4s ease-in-out infinite; }
`}</style>

    </>
  );
}
