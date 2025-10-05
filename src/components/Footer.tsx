// src/components/Footer.tsx
"use client";
import { Instagram,  Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from '../assets/ONOstories_logo.jpg';

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function XLogo({ size = 26 }) {
  return (
    <svg height={size} width={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19.79 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L6.535 21.75H3.227l7.73-8.835L2.8 2.25h6.828l4.713 6.231zm-1.37 16.92h2.045L8.03 4.124H5.744z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="new_footer_area" style={{ background: 'linear-gradient(135deg, #e0c3fc 0%, #f9c6e0 40%, #f7b267 80%, #f3e7fe 100%)' }}>
      <div className="new_footer_top">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          
          {/* 3-Column Grid */}
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            
            {/* Column 1: Brand */}
            <div className="flex flex-col items-start text-left">
              <Link to="/" className="mb-4" onClick={scrollToTop}>
                <img
                  className="h-12 w-auto"
                  src={logo}
                  alt="ONOStories Logo"
                />
              </Link>
              <p className="text-base text-[#4C1D95] italic">
                <b>YOUR KID IS THE MAIN CHARACTER</b>
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="text-left lg:text-center">
              <h3 className="f-title">Quick Links</h3>
              <ul className="f_list">
                <li>
                  <Link to="/" onClick={scrollToTop}>Home</Link>
                </li>
                <li>
                  <Link to="/about" onClick={scrollToTop}>About Us</Link>
                </li>
                <li>
                  <Link to="/story-library" onClick={scrollToTop}>Story Library</Link>
                </li>
                <li>
                  <Link to="/pricing" onClick={scrollToTop}>Pricing</Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Social Links */}
            <div className="text-left lg:text-right">
              <h3 className="f-title ">Follow Us</h3>
              <div className="f_social_icon -mt-4">
                <a href="https://x.com/onostoriess" target="_blank" rel="noopener noreferrer"><XLogo size={20} /></a>
                <a href="https://www.instagram.com/onostories.app/?hl=en" target="_blank" rel="noopener noreferrer"><Instagram /></a>
                <a href="https://www.linkedin.com/company/ono-stories/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer"><Linkedin /></a>
              </div>
              <h3 className="f-title mt-4">Contact & Support</h3>
              <div className="-mt-4 text-[#4C1D95] font-light bold">
                <p>onostories@gmail.com</p>
              </div>

            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="footer_bg">
          <div className="footer_bg_one"></div>
          <div className="footer_bg_two"></div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer_bottom">
        <div className="container mx-auto">
          <p className="-mb-4">
            © {new Date().getFullYear()} ONOStories Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
