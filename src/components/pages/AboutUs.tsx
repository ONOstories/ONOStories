import { Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import { Footer } from '../Footer';
import './AboutUs.css'; 
import logo from '../../assets/ONOstories_logo.jpg';
import rohitImage from '../../assets/Yashphoto.jpg';

export function AboutUs() {
  return (
    <div className="about-us-container">
      <Navbar forceSolidBackground={true} />
      <main className="about-us-main-content">
        
        {/* Hero Section */}
        <section className="about-hero-section">
          <img src={logo} alt="ONO Stories Logo" className="about-logo" />
          <h1 className="about-main-title">AI Edutainment Platform for Kids</h1>
          <p className="about-main-subtitle">
            At ONO Stories, we craft personalized journeys where your child is the hero, transforming learning into a magical adventure.
          </p>
        </section>

        {/* Mission Section */}
        <section className="about-mission-section">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-section-paragraph">
            We’re on a quest to make learning effortless and joyful through stories that feel personal. We focus on value-driven storytelling where kids don’t just watch—they become part of the narrative.
          </p>
          <div className="story-types-container">
            <span className="story-badge badge-bedtime">Bedtime Stories</span>
            <span className="story-badge badge-moral">Moral Value Stories</span>
            <span className="story-badge badge-educational">Educational Stories</span>
          </div>
        </section>

        {/* Why We Started Section */}
        <section className="why-we-started-section expanded-layout">
          <div className="why-we-started-text">
            <h2 className="about-section-title alt">Why We Started</h2>
            <p className="about-section-paragraph">
              As a child, I’d gaze at the night sky, my head filled with questions: "What’s out there? How do stars shine?" My curiosity often drifted away, unanswered.
            </p>
            <p className="about-section-paragraph">
              Today, AI gives us the power to answer those questions in the most vivid way possible. We built ONO Stories to be the bridge between a child's wonder and the universe of knowledge.
            </p>
            <p className="about-section-paragraph">
              We transform their "what ifs" into vibrant, living stories. Whether it’s about stars, kindness, or the mysteries of science, your child's curiosity becomes their greatest teacher. Imagination is no longer just a thought—it's an experience.
            </p>
          </div>
        </section>

        {/* Meet the Founder Section */}
        <section className="founder-section-split">
          <div className="founder-image-container">
            <img src={rohitImage} alt="Rohit - Founder of ONO Stories" className="founder-split-image" />
          </div>
          <div className="founder-details-container">
            <h2 className="about-section-title">Meet the Founder</h2>
            <h3 className="founder-name">Meet Rohit</h3>
            <p className="founder-bio">
              Hi, I’m Rohit, a 22-year-old on a mission to provide real value to society. When I’m not building ONO Stories, I love to dance and paint. My vision is simple: to empower the next generation with stories that make them wiser, kinder, and more imaginative.
            </p>
            <div className="founder-socials">
              <a href="https://x.com/Rohit_Raut1" target="_blank" rel="noopener noreferrer" className="social-button twitter">
                <Twitter size={20} />
                Twitter
              </a>
              <a href="https://www.linkedin.com/in/rohitraut01/" target="_blank" rel="noopener noreferrer" className="social-button linkedin">
                <Linkedin size={20} />
                LinkedIn
              </a>
            </div>
          </div>
        </section>
        
        <div className="back-home-link-container">
            <Link to="/" className="back-home-link">
              Explore Stories
            </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}