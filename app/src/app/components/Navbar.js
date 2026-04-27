"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "py-2.5 backdrop-blur-xl bg-bg-primary/80 border-b border-white/6"
          : "py-4 border-b border-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group" id="navLogo">
          <div className="transition-transform duration-400 group-hover:rotate-[20deg] group-hover:scale-110">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="url(#logoGrad)" strokeWidth="2" />
              <path
                d="M9 14C9 14 11 9 14 9C17 9 19 14 19 14C19 14 17 19 14 19C11 19 9 14 9 14Z"
                fill="url(#logoGrad)"
              />
              <circle cx="14" cy="14" r="3" fill="#0a0a0f" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                  <stop offset="0%" stopColor="#6C63FF" />
                  <stop offset="100%" stopColor="#00D4AA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="font-[var(--font-display)] text-xl font-bold gradient-text">
            Genovix
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-9">
          {[
            { label: "Home", href: "#hero" },
            { label: "Drug Database", href: "#drug-database" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "About", href: "#about" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary relative py-1 transition-colors duration-200 group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent-purple to-accent-teal rounded-full transition-all duration-400 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link href="/prediction">
            <button
              id="getStartedNav"
              className="btn-glow text-sm font-semibold px-6 py-2.5 rounded-xl text-white cursor-pointer"
            >
              Start Prediction
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-1 cursor-pointer"
          aria-label="Toggle menu"
          id="mobileMenuToggle"
        >
          <span
            className={`block w-6 h-0.5 bg-text-secondary rounded transition-transform duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-text-secondary rounded transition-opacity duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-text-secondary rounded transition-transform duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-card mt-2 mx-4 rounded-2xl p-6 flex flex-col gap-4 animate-[slideUp_0.3s_ease-out]">
          {[
            { label: "Home", href: "#hero" },
            { label: "Drug Database", href: "#drug-database" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "About", href: "#about" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-text-secondary hover:text-text-primary transition-colors py-2 text-lg font-medium"
            >
              {item.label}
            </a>
          ))}
          <Link href="/prediction" className="w-full">
            <button className="btn-glow mt-2 text-sm font-semibold px-6 py-3 rounded-xl text-white w-full cursor-pointer">
              Start Prediction
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
