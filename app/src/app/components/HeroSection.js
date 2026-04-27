"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Dna, Activity, Users, Pill } from "lucide-react";
import Link from "next/link";

function useSplineScript() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!document.querySelector('script[data-spline-viewer]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@splinetool/viewer@1.12.78/build/spline-viewer.js";
      script.setAttribute("data-spline-viewer", "true");
      document.head.appendChild(script);
    }
    
    // Safety fallback: force loaded state after a few seconds
    // in case the web component load event doesn't fire reliably in React
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return { loaded, setLoaded };
}

function StatCard({ icon: Icon, target, suffix, label, delay }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = target;
      const duration = 2000;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 4);

        setCount(Math.floor(easedProgress * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      const timeout = setTimeout(() => requestAnimationFrame(animate), delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, target, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="flex items-center gap-4 px-7 py-5 rounded-2xl glass-card transition-colors duration-300 hover:bg-bg-card-hover hover:border-accent-purple/30 group cursor-default"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-purple/10 text-accent-purple group-hover:text-accent-teal transition-colors duration-500 shrink-0">
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col items-start">
        <div className="flex items-baseline">
          <span className="font-[var(--font-display)] text-2xl font-bold text-text-primary tracking-tight">
            {count.toLocaleString()}
          </span>
          <span className="font-[var(--font-display)] text-xl font-bold text-accent-teal ml-0.5">
            {suffix}
          </span>
        </div>
        <span className="text-xs text-text-muted font-medium uppercase tracking-wider mt-0.5">{label}</span>
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } },
  };

  const { loaded, setLoaded } = useSplineScript();

  return (
    <section id="hero" className="relative z-[1] min-h-screen flex items-center pt-[140px] pb-20">

      {/* Spline 3D background — hero section only */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none",
        opacity: loaded ? 1 : 0,
        transition: "opacity 1.2s ease-in-out",
        willChange: "opacity",
      }}>
        <spline-viewer
          url="https://prod.spline.design/7j-sp3BDADmlRNUE/scene.splinecode"
          style={{
            width: "100%", height: "100%", display: "block",
            pointerEvents: "all",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />
        {/* Smooth fade at bottom edge */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 35%, rgba(0,0,0,0.95) 100%)"
        }} />
        {/* Watermark cover */}
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: "200px", height: "50px",
          background: "#000000", zIndex: 10, pointerEvents: "none"
        }} />
      </div>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1200px] mx-auto px-8 text-center relative z-[2] w-full"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-card border-accent-purple/20 text-[0.85rem] font-medium text-accent-purple-light shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-teal"></span>
            </span>
            <span>Powered by Advanced AI & Machine Learning</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1 
          variants={itemVariants}
          className="font-[var(--font-display)] text-[clamp(2.74rem,5.88vw,5.39rem)] font-extrabold leading-[1.05] tracking-tight mb-6"
        >
          <span className="gradient-text">Genovix</span>
          <br />
          <span className="text-text-primary drop-shadow-sm">AI Recommendation</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          variants={itemVariants}
          className="text-[clamp(1.1rem,1.5vw,1.3rem)] text-text-secondary max-w-[680px] mx-auto mb-12 leading-relaxed"
        >
          Intelligent recommendations driven by your{" "}
          <span className="text-accent-purple-light font-semibold relative inline-block">
            genetic data
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-purple-light/40 rounded-full" />
          </span>{" "}
          and{" "}
          <span className="text-accent-teal font-semibold relative inline-block">
            medical history
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-teal/40 rounded-full" />
          </span>{" "}
          — delivering personalized healthcare insights with precision.
        </motion.p>

        {/* Buttons */}
        <motion.div variants={itemVariants} className="flex justify-center gap-5 mb-24 flex-col sm:flex-row items-center">
          <Link href="/prediction">
            <button className="btn-glow inline-flex items-center gap-2.5 px-8 py-4 rounded-[14px] text-white text-base font-semibold cursor-pointer group">
              <span>Explore System</span>
              <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
          <a href="#how-it-works">
            <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-[14px] bg-white/5 border border-white/10 text-white text-base font-semibold transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:text-white hover:-translate-y-1 backdrop-blur-sm cursor-pointer hover:shadow-lg">
              <span>Learn More</span>
            </button>
          </a>
        </motion.div>

        {/* Stats */}
        <div className="flex justify-center gap-6 flex-col sm:flex-row items-center">
          <StatCard
            target={21}
            suffix=""
            label="Genetic Markers"
            icon={Dna}
            delay={0.6}
          />
          <StatCard
            target={84}
            suffix="%"
            label="Accuracy Rate"
            icon={Activity}
            delay={0.8}
          />
          <StatCard
            target={300000}
            suffix="+"
            label="Patients Analyzed"
            icon={Users}
            delay={1.0}
          />
          <StatCard
            target={15}
            suffix=""
            label="Drugs Supported"
            icon={Pill}
            delay={1.2}
          />
        </div>
      </motion.div>
    </section>
  );
}
