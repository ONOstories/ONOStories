"use client";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
/* Pastel CTA without stars ─ matches the WhatMakesSpecial palette */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
export function PlayfulCTA() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const goOrLogin = (targetPath: string) => {
    if (loading) return;
    if (!user) {
      navigate('/login', { state: { redirectTo: targetPath, from: location.pathname } });
    } else {
      navigate(targetPath);
    }
  };
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
          onClick={() => { goOrLogin('/create-stories'); scrollToTop(); }}
          className="flex items-center justify-center mx-auto space-x-2 rounded-full bg-gradient-to-r from-[#9333EA] to-[#DB2777] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-[#7E22CE] hover:to-[#BE185D] md:text-lg"
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
