"use client";
import React from "react";
import { Check, Star, Hourglass } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Pricing() {
  const navigate = useNavigate();
  /* ------------ helpers ------------ */
  const handleSubscription = (plan: string) => {
    alert(
      `This is a demo app. In a real application, this would redirect to payment processing for the ${plan} plan.`
    );
  };

  /* ------------ plan data ------------ */
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out ONOSTORIES",
      features: [
        "4-5 pre-made demo stories",
        "View stories online only",
        "Sample different story types",
        "Basic story experience",
      ],
      buttonText: "Get Started Free",
      buttonAction: () => navigate("library"),
      gradient: "from-gray-400 to-gray-500",
    },
    {
      name: "Pro Monthly",
      price: "$9.99",
      period: "per month",
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
      buttonText: "Start Pro Monthly",
      buttonAction: () => handleSubscription("monthly"),
      popular: true,
      gradient: "from-[#4C1D95] to-[#2E1065]",
    },
    {
      name: "Pro 6-Month",
      price: "$49.99",
      period: "every 6 months",
      originalPrice: "$59.94",
      description: "Best value for regular storytellers",
      features: [
        "All Pro Monthly features",
        "Save 17 % compared to monthly",
        "Extended story library",
        "Priority AI processing",
      ],
      buttonText: "Choose 6-Month Plan",
      buttonAction: () => handleSubscription("6month"),
      gradient: "from-purple-400 to-pink-500",
    },
    {
      name: "Premium (Coming Soon)",
      price: "",
      period: "",
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

  /* ------------ render ------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* headline */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#4C1D95] to-[#2E1065] bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-[#4C1D95]/90 max-w-3xl mx-auto">
            Start free with demo stories, then upgrade to create unlimited personalized adventures for your child.
          </p>
        </header>

        {/* pricing grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col bg-white rounded-2xl shadow-lg p-8 transition
                hover:-translate-y-1 hover:shadow-2xl`}
            >
              {/* badges */}
              {plan.popular && (
                <Badge text="Most Popular" icon={<Star className="h-4 w-4" />} />
              )}
              {plan.comingSoon && (
                <Badge text="Coming Soon" icon={<Hourglass className="h-4 w-4" />} />
              )}

              {/* plan info */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#2E1065] mb-2">
                  {plan.name}
                </h3>

                {plan.price ? (
                  <div className="mb-4">
                    <span className="text-4xl font-extrabold text-[#2E1065]">
                      {plan.price}
                    </span>
                    <span className="text-[#4C1D95]">/{plan.period}</span>
                    {plan.originalPrice && (
                      <div className="text-sm text-[#4C1D95]/70 line-through mt-1">
                        {plan.originalPrice}
                      </div>
                    )}
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
                className={`w-full py-4 rounded-xl font-semibold text-white active:scale-95 transition
                  bg-gradient-to-r ${plan.gradient}
                  ${plan.comingSoon ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg"}`}
              >
                {plan.buttonText}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/* badge component */
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
