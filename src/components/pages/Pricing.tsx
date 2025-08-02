"use client";
import React, { useState } from "react";
import { Check, Star, Hourglass } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ----------  Badge (unchanged)  ---------- */
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

/* ----------  Main component  ---------- */
export function Pricing() {
  const navigate = useNavigate();
  // Animated pro plan message if redirected from CreateStories
  const { state } = (typeof window !== "undefined" && window.history && window.history.state && window.history.state.usr) ? window.history.state.usr : {};
  // If using react-router-dom v6, use useLocation and location.state
  // const location = useLocation();
  // const state = location.state;
  const [showProAnim, setShowProAnim] = useState(false);
  React.useEffect(() => {
    if (state && state.animatePro) {
      setShowProAnim(true);
      setTimeout(() => setShowProAnim(false), 3000);
    }
  }, [state]);

  /* billing-cycle state — "monthly" | "yearly"  */
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  /* base plan data (store monthly price only) */
  const plans = [
    {
      name: "Free",
      monthly: 0,
      description: "Perfect for trying out ONOSTORIES",
      features: [
        "4–5 pre-made demo stories",
        "View stories online only",
        "Sample different story types",
        "Basic story experience",
      ],
      buttonText: "Get Started Free",
      buttonAction: () => navigate("library"),
      gradient: "from-gray-400 to-gray-500",
    },
    {
      name: "Pro",
      monthly: 9.99,
      description: "Full access to personalized storytelling",
      features: [
        "Upload child photos (4-5 images)",
        "Unlimited personalized stories",
        "3 main genres + sub-genres",
        "Custom genre option",
        "Download stories as PDF",
        "Story history & regeneration",
        "Priority customer support",
      ],
      buttonText: "Start Pro",
      buttonAction: () => alert("Redirect to Pro checkout"),
      popular: true,
      gradient: "from-[#4C1D95] to-[#2E1065]",
    },
    {
      name: "Premium (Coming Soon)",
      monthly: null, // hide price until launch
      description: "Our most powerful plan is almost here!",
      features: [
        "Unlimited personalized stories",
        "Exclusive premium themes",
        "Early-access story drops",
        "Priority AI processing",
        "Family sharing perks",
        "Holiday mega-collections",
        "Save 25 % compared to monthly",
        "Extended story library",
      ],
      buttonText: "Launching Soon",
      buttonAction: () => alert("Premium plan launching soon!"),
      comingSoon: true,
      gradient: "from-[#2E1065] to-[#4C1D95]",
    },
  ];

  /* yearly discount constants */
  const yearlyMultiplier = 0.7507;   // = 24.93 % off
  const yearlyDiscountPercent = 25;  // rounded label

  /* helper: derive yearly total & monthly-equiv labels */
  const getPriceLabel = (monthly: number | null) => {
    if (monthly === null) return "";

    if (cycle === "monthly") {
      // show single monthly amount → “$9.99”
      return `$${monthly.toFixed(2)}`;
    }

    // yearly: show “$7.50/mo”
    const perMonth = monthly * yearlyMultiplier;
    return `$${perMonth.toFixed(2)}/mo`;
  };

  /* ----------  render  ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-16 px-4">
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
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#4C1D95] to-[#2E1065] bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-[#4C1D95]/90 max-w-3xl mx-auto">
            Start free with demo stories, then upgrade to create unlimited personalized adventures for your child.
          </p>
        </header>

        {/* billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="relative inline-flex rounded-full bg-white/90 shadow-lg">
            {/* sliding pill */}
            <span
              className={`absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-[#4C1D95] to-[#2E1065] transition-transform duration-200 ease-out ${
                cycle === "yearly" ? "translate-x-full" : ""
              }`}
            />
            {/* Monthly */}
            <button
              onClick={() => setCycle("monthly")}
              className={`relative z-10 h-12 w-40 text-base font-semibold rounded-full transition-colors duration-200 ${
                cycle === "monthly" ? "text-white" : "text-[#4C1D95]"
              }`}
            >
              Monthly
            </button>
            {/* Yearly */}
            <button
              onClick={() => setCycle("yearly")}
              className={`relative z-10 h-12 w-40 text-base font-semibold rounded-full transition-colors duration-200 ${
                cycle === "yearly" ? "text-white" : "text-[#4C1D95]"
              }`}
            >
              Yearly{" "}
              <span
                className={`ml-1 font-medium ${
                  cycle === "yearly" ? "text-emerald-200" : "text-[#2E1065]"
                }`}
              >
                Save {yearlyDiscountPercent}%
              </span>
            </button>
          </div>
        </div>

        {/* pricing cards */}
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan) => {
            const priceLabel = getPriceLabel(plan.monthly);

            return (
              <article
                key={plan.name}
                className="relative flex flex-col bg-white rounded-2xl shadow-lg p-8 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* badges */}
                {plan.popular && (
                  <Badge text="Most Popular" icon={<Star className="h-4 w-4" />} />
                )}
                {plan.comingSoon && (
                  <Badge text="Coming Soon" icon={<Hourglass className="h-4 w-4" />} />
                )}

                {/* plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#2E1065] mb-2">
                    {plan.name}
                  </h3>

                  {plan.monthly !== null ? (
                    <div className="mb-4">
                      <span className="text-4xl font-extrabold text-[#2E1065]">
                        {priceLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-4 h-10 flex items-center justify-center text-[#4C1D95]/60 italic">
                      Launching Soon
                    </div>
                  )}

                  <p className="text-[#4C1D95]/90">{plan.description}</p>
                </div>

                {/* features */}
                <ul
                  className={`space-y-4 mb-8 flex-1 ${
                    plan.comingSoon ? "blur-sm select-none pointer-events-none" : ""
                  }`}
                >
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                      <span className="text-[#4C1D95]">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={plan.buttonAction}
                  disabled={plan.comingSoon}
                  className={`w-full py-4 rounded-xl font-semibold text-white active:scale-95 transition bg-gradient-to-r ${plan.gradient} ${
                    plan.comingSoon ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg"
                  }`}
                >
                  {plan.buttonText}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
