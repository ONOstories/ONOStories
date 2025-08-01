import React from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';

interface PricingProps {
  setCurrentPage: (page: string) => void;
}

export function Pricing({ setCurrentPage }: PricingProps) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out ONOSTORIES',
      features: [
        '4-5 pre-made demo stories',
        'View stories online only',
        'Sample different story types',
        'Basic story experience'
      ],
      buttonText: 'Get Started Free',
      buttonAction: () => setCurrentPage('library'),
      popular: false,
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Pro Monthly',
      price: '$9.99',
      period: 'per month',
      description: 'Full access to personalized storytelling',
      features: [
        'Upload child photos (4-5 images)',
        'Unlimited personalized stories',
        '3 main genres + sub-genres',
        'Custom genre option',
        'Download stories as PDF',
        'Story history & regeneration',
        'Priority customer support'
      ],
      buttonText: 'Start Pro Monthly',
      buttonAction: () => handleSubscription('monthly'),
      popular: true,
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      name: 'Pro 6-Month',
      price: '$49.99',
      period: 'every 6 months',
      originalPrice: '$59.94',
      description: 'Best value for regular storytellers',
      features: [
        'All Pro Monthly features',
        'Save 17% compared to monthly',
        'Extended story library',
        'Bonus story templates',
        'Priority AI processing'
      ],
      buttonText: 'Choose 6-Month Plan',
      buttonAction: () => handleSubscription('6month'),
      popular: false,
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      name: 'Pro Annual',
      price: '$89.99',
      period: 'per year',
      originalPrice: '$119.88',
      description: 'Maximum savings for storytelling families',
      features: [
        'All Pro Monthly features',
        'Save 25% compared to monthly',
        'Exclusive annual story themes',
        'Early access to new features',
        'Premium customer support',
        'Special holiday story collections'
      ],
      buttonText: 'Choose Annual Plan',
      buttonAction: () => handleSubscription('annual'),
      popular: false,
      gradient: 'from-green-500 to-blue-500'
    }
  ];

  const handleSubscription = (plan: string) => {
    alert(`This is a demo app. In a real application, this would redirect to payment processing for the ${plan} plan.`);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free with demo stories, then upgrade to create unlimited personalized adventures for your child.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                plan.popular 
                  ? 'ring-4 ring-purple-500 ring-opacity-30 transform scale-105' 
                  : 'hover:shadow-2xl'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-500 line-through mt-1">
                      {plan.originalPrice}
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.buttonAction}
                className={`w-full py-4 rounded-xl font-semibold transition-all transform hover:scale-105 bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[
              {
                question: "How does the free plan work?",
                answer: "The free plan gives you access to 4-5 pre-made demo stories that showcase our platform's capabilities. These stories feature different characters and genres to help you understand the quality and variety we offer."
              },
              {
                question: "What makes Pro plans special?",
                answer: "Pro plans allow you to upload your child's photos and create truly personalized stories where they become the main character. You get unlimited story generation, multiple genres, and the ability to download PDF versions."
              },
              {
                question: "Can I change or cancel my subscription?",
                answer: "Yes! You can upgrade, downgrade, or cancel your subscription at any time. If you cancel, you'll retain Pro access until your current billing period ends, then automatically return to the free plan."
              },
              {
                question: "Are the stories safe for children?",
                answer: "Absolutely! All our AI-generated content is carefully filtered and designed to be age-appropriate, educational, and promote positive values. We prioritize child safety in every story we create."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}