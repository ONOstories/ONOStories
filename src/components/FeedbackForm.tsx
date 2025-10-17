import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import { MessageSquare, X } from 'lucide-react';
import './FeedbackForm.css';

export function FeedbackForm() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [loveMost, setLoveMost] = useState('');
  const [improve, setImprove] = useState('');
  const [wantsEarlyAccess, setWantsEarlyAccess] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emojis = [
    { label: 'Excellent', symbol: '🤩' },
    { label: 'Good', symbol: '🙂' },
    { label: 'Okay', symbol: '😐' },
    { label: 'Bad', symbol: '🙁' },
  ];

  const handleFormToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
        setSelectedReview(null);
        setIsSubmitted(false);
        setWantsEarlyAccess(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) {
        alert("Please select a rating by clicking an emoji.");
        return;
    }
    setIsLoading(true);

    const { error } = await supabase.from('feedback_responses').insert({
        page_slug: 'landing-page',
        rating: selectedReview,
        love_most: loveMost,
        can_improve: improve,
        wants_early_access: wantsEarlyAccess,
        // --- ✅ FIX: Automatically add the logged-in user's email ---
        email: user?.email, 
    });

    setIsLoading(false);

    if (error) {
        console.error('Error submitting feedback:', error);
        alert('Sorry, there was an issue submitting your feedback. Please try again.');
    } else {
        setIsSubmitted(true);
    }
  };
  
  if (!user) {
    return null;
  }

  if (isSubmitted) {
    return (
        <div className={`feedback-container ${isOpen ? 'open' : ''}`}>
             <button onClick={handleFormToggle} className="feedback-fab">
                <X size={24} />
            </button>
            <div className="feedback-form submitted">
                <h3>Thank You!</h3>
                <p>Your feedback has been received. We appreciate you taking the time to help us improve.</p>
            </div>
        </div>
    );
  }

  return (
    <div className={`feedback-container ${isOpen ? 'open' : ''}`}>
      <button onClick={handleFormToggle} className="feedback-fab" aria-label="Toggle feedback form">
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
      
      {isOpen && (
        <form onSubmit={handleSubmit} className="feedback-form">
          <h3 className="feedback-title">Share Your Feedback</h3>
          <p className="feedback-subtitle">How was your experience today?</p>
          
          <div className="emoji-inputs">
            {emojis.map(({ label, symbol }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                title={label}
                className={`emoji-btn ${selectedReview === label ? 'selected' : ''}`}
                onClick={() => setSelectedReview(label)}
              >
                {symbol}
              </button>
            ))}
          </div>

          <div className="feedback-fields">
            <label htmlFor="loveMost">What did you love most?</label>
            <input
              id="loveMost"
              type="text"
              value={loveMost}
              onChange={(e) => setLoveMost(e.target.value)}
              placeholder="e.g., The story illustrations"
              maxLength={200}
            />

            <label htmlFor="improve">What can we improve?</label>
            <input
              id="improve"
              type="text"
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              placeholder="e.g., More story genres"
              maxLength={200}
            />
            
            <label>Would you like early access to our next update?</label>
            <div className="toggle-switch">
              <button
                type="button"
                className={wantsEarlyAccess === true ? 'active' : ''}
                onClick={() => setWantsEarlyAccess(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={wantsEarlyAccess === false ? 'active' : ''}
                onClick={() => setWantsEarlyAccess(false)}
              >
                No
              </button>
            </div>
          </div>

          <button type="submit" className="submit-review-btn" disabled={isLoading || !selectedReview}>
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      )}
    </div>
  );
}