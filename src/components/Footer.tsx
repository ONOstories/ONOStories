"use client";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden text-white">
      {/* ───── background gradient ───── */}
      <div className="absolute inset-0 from-[#FFF7ED] to-[#FFE9F3] text-[#2E1065]" />

      {/* ───── wavy top edge ───── */}


      {/* ───── content grid ───── */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 grid gap-16 md:grid-cols-3">
        {/* 1 ▸ Brand */}
        <div>
          <h3 className="text-3xl font-extrabold mb-4 tracking-tight text-[#2E1065]">ONOStories</h3>
          <p className="leading-relaxed text-[#4C1D95]">
            Personalized, AI-powered storybooks that turn your child into the hero of every adventure.
          </p>
        </div>

        {/* 2 ▸ Quick links */}
        <nav aria-label="footer links" className="flex flex-col gap-3 text-[#4C1D95]">
          {["Home", "How It Works", "Features", "Pricing"].map(link => (
            <a key={link} href="#" className="hover:text-[#2E1065] transition-colors">
              {link}
            </a>
          ))}
        </nav>

        {/* 3 ▸ Newsletter + socials */}
        <div className="flex flex-col gap-8">
          {/* newsletter */}
          <form className="flex w-full rounded-full overflow-hidden bg-white/90 backdrop-blur-md">
            <input
              type="email"
              required
              placeholder="Join our newsletter"
              className="flex-1 px-5 py-3 text-gray-700 placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              className="flex items-center bg-violet-600 px-6 hover:bg-violet-700 transition"
            >
              <Mail className="h-5 w-5 text-white" />
            </button>
          </form>

          {/* socials */}
          <div className="flex gap-5">
            <Social label="Twitter">
              <Twitter className="h-5 w-5" />
            </Social>
            <Social label="Facebook">
              <Facebook className="h-5 w-5" />
            </Social>
            <Social label="Instagram">
              <Instagram className="h-5 w-5" />
            </Social>
          </div>
        </div>
      </div>

      {/* ───── copyright bar ───── */}
      <div className="relative bg-black/10 py-4 text-center text-sm text-[#4C1D95]">
        © {new Date().getFullYear()} ONOStories. All rights reserved.
      </div>
    </footer>
  );
}

/* ——— helpers ——— */
function Social({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition"
    >
      {children}
    </a>
  );
}