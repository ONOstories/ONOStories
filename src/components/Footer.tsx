// src/components/Footer.tsx

"use client";
import { Instagram, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from 'public/ONOstories_logo.jpg';

export function Footer() {
  return (
    <footer className="new_footer_area">
      <div className="new_footer_top">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          
          {/* 3-Column Grid */}
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            
            {/* Column 1: Brand */}
            <div className="flex flex-col items-start text-left">
              <Link to="/" className="mb-4">
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
                <li><a href="#">Home</a></li>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </div>

            {/* Column 3: Social Links */}
            <div className="text-left lg:text-right">
              <h3 className="f-title">Follow Us</h3>
              <div className="f_social_icon">
                <a href="https://x.com/onostoriess" target="_blank" rel="noopener noreferrer"><Twitter /></a>
                <a href="https://www.instagram.com/onostories.app/?hl=en" target="_blank" rel="noopener noreferrer"><Instagram /></a>
                <a href="https://www.linkedin.com/company/ono-stories/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer"><Linkedin /></a>
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
          <p className="mb-0">
            © {new Date().getFullYear()} ONOStories Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}