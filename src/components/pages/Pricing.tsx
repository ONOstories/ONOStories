import Navbar from '../Navbar';

import React, { useState } from "react";
import { Check, Star, Hourglass } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { supabase } from "../../lib/supabaseClient";

const plansData = {
  monthly: { name: "Pro Monthly", price: 399, currency: "INR" },
  annual: { name: "Pro Annual", price: 4214, currency: "INR" },
};

function Badge({ text, icon }: { text: string; icon: React.ReactNode }) {
  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
      <span className="flex items-center gap-1 bg-gradient-to-r from-[#4C1D95] to-[#2E1065] text-white px-4 py-1.5 rounded-full text-xs font-semibold">
        {icon}
        {text}
      </span>
    </div>
  );
}

export function Pricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [cycle, setCycle] = useState<"monthly" | "annual">("annual");
  const [isLoading, setIsLoading] = useState<"monthly" | "annual" | null>(null);

  // Animation for redirects
  const [showProAnim, setShowProAnim] = useState(location.state?.animatePro || false);
  React.useEffect(() => {
    if (showProAnim) {
      const timer = setTimeout(() => setShowProAnim(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showProAnim]);

  // Main payment handler
  const handlePayment = async (planId: "monthly" | "annual") => {
    if (!user) {
      // If not logged in, redirect to login with "redirectTo" to come back to pricing
      navigate("/login", { state: { redirectTo: "/pricing" } });
      return;
    }
    setIsLoading(planId);

    try {
      const { data: order, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { planId, userId: user.id },
      });

      if (orderError) throw new Error(orderError.message);
      if (!order) throw new Error("Failed to create order.");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "ONOSTORIES Pro",
        description: `Purchase ${plansData[planId].name} Plan`,
        order_id: order.id,
        handler: function () {
          alert("Payment successful! Your account will be updated shortly.");
          navigate("/");
        },
        prefill: {
          name: profile?.name || "",
          email: user.email,
        },
        theme: {
          color: "#4C1D95",
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Payment failed:", error);
      alert(`Payment failed: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'linear-gradient(135deg, #f3e7fe 0%, #f9c6e0 50%, #f7b267 100%)' }}>
      <Navbar forceSolidBackground={true} />
      {showProAnim && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl shadow-xl flex items-center space-x-4 animate-bounce">
            <span role="img" aria-label="lock" className="text-2xl">🔒</span>
            <span className="font-bold text-lg">Unlock Pro Features to Create Stories!</span>
            <span className="bg-white text-pink-600 font-bold px-3 py-1 rounded-full animate-pulse">Pro Plan</span>
          </div>
        </div>
      )}
      <div className="max-w-8xl mx-auto">
        {/* headline */}
        <header className="text-center mb-12">
          <br />
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#4C1D95] to-[#2E1065] bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-[#4C1D95]/90 max-w-3xl mx-auto">
            Upgrade to Pro Plan to create Personalized adventures for your child.
          </p>
          <div className="mt-6">
            <span className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg shadow-lg animate-pulse">
              🚀 Launch Offer: Get Pro Annual at 12% OFF! Limited Time Only!
            </span>
          </div>
        </header>
        {/* billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="relative inline-flex rounded-full bg-white/90 shadow-lg">
            {/* sliding pill */}
            <span
              className={`absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-[#4C1D95] to-[#2E1065] transition-transform duration-200 ease-out ${cycle === "annual" ? "translate-x-full" : ""
                }`}
            />
            {/* Monthly */}
            <button
              onClick={() => setCycle("monthly")}
              className={`relative z-10 h-12 w-40 text-base font-semibold rounded-full transition-colors duration-200 ${cycle === "monthly" ? "text-white" : "text-[#4C1D95]"
                }`}
            >
              Monthly
            </button>
            {/* Annual */}
            <button
              onClick={() => setCycle("annual")}
              className={`relative z-10 h-12 w-40 text-base font-semibold rounded-full transition-colors duration-200 ${cycle === "annual" ? "text-white" : "text-[#4C1D95]"
                }`}
            >
              Annual
              <span
                className={`ml-1 font-medium ${cycle === "annual" ? "text-emerald-200" : "text-[#2E1065]"
                  }`}
              >
                Save 12%
              </span>
            </button>
          </div>
        </div>
        {/* pricing cards */}
        <div className="flex flex-wrap justify-center gap-8">
          {/* --- FREE PLAN --- */}
          <article
            className="relative flex flex-col w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 transition-all duration-200 hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#2E1065] mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-extrabold text-[#2E1065]">₹0</span>
                <span className="text-xs font-extrabold text-gray-500">/month</span>
              </div>
              <p className="text-[#4C1D95]/90">Perfect for trying out ONOSTORIES</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">4–5 pre-made demo stories</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">View and download pre-made demo stories</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Sample different story types</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Basic story experience</span></li>
            </ul>
            <button
              onClick={() => navigate("/story-library")}
              className="w-full py-3 mt-8 rounded-xl font-semibold text-white bg-gray-500 hover:bg-gray-600 transition">
              Get Started Free
            </button>
          </article>
          {/* --- PRO PLAN --- */}
          <article
            className="relative flex flex-col w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 transition-all duration-200 hover:scale-105 hover:shadow-2xl"
          >
            <Badge text="Most Popular" icon={<Star className="h-4 w-4" />} />
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#2E1065] mb-2">Pro</h3>
              <div className="mb-4 flex items-center justify-center gap-3">
                {cycle === 'annual' ? (
                  <>
                    <span
                      className="text-2xl text-gray-400 line-through font-semibold"
                      style={{ textDecorationThickness: '2px', textDecorationColor: '#e53e3e' }}
                    >
                      ₹4,788
                    </span>
                    <span className="text-4xl font-extrabold text-[#2E1065]">
                      ₹4212
                      <span className="text-xs font-regular text-gray-500">/year</span>
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-extrabold text-[#2E1065]">
                    ₹{plansData.monthly.price} <span className="text-xs text-gray-500">/month</span>
                  </span>
                )}
              </div>
              <p className="text-[#4C1D95]/90">Full access to personalized storytelling</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-[#4C1D95]">Personalized stories for your child</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-[#4C1D95]"> Explore and generate stories by choosing preferred genres</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-[#4C1D95]"> Instantly download your favorite stories as beautiful PDFs</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-[#4C1D95]"> Save and revisit every story in your personal library</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span className="text-[#4C1D95]"> Regenerate any story for fresh, exciting adventures</span>
              </li>
            </ul>
            <button
              onClick={() => handlePayment(cycle)}
              disabled={!!isLoading}
              className="w-full py-4 mt-8 rounded-xl font-semibold text-white bg-gradient-to-r from-[#4C1D95] to-[#2E1065] hover:shadow-lg disabled:opacity-50 transition">
              {isLoading === cycle ? "Processing..." : `Start Pro ${cycle === 'monthly' ? 'Monthly' : 'Annually'}`}
            </button>
          </article>
          {/* --- PREMIUM PLAN (Coming Soon) --- */}
          <article
            className="relative flex flex-col w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 opacity-60 cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-2xl"
          >
            <Badge text="Coming Soon" icon={<Hourglass className="h-4 w-4" />} />
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#2E1065] mb-2">Premium (Coming Soon)</h3>
              <div className="mb-4 h-10 flex items-center justify-center text-[#4C1D95]/60 italic">
                Launching Soon
              </div>
              <p className="text-[#4C1D95]/90">Our most powerful plan is almost here!</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1 blur-sm select-none pointer-events-none">
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Unlimited personalized stories</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Exclusive premium themes</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Early-access story drops</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Priority AI processing</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Family sharing perks</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Holiday mega-collections</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Save 25 % compared to monthly</span></li>
              <li className="flex items-start gap-3"><Check className="h-5 w-5 text-emerald-500 mt-0.5" /><span className="text-[#4C1D95]">Extended story library</span></li>
            </ul>
            <button
              disabled
              className="w-full py-4 mt-8 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2E1065] to-[#4C1D95] opacity-60 cursor-not-allowed">
              Launching Soon
            </button>
          </article>
        </div>
      </div>
    </div>
  );
}
