"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section id="about" className="relative z-[1] py-[120px]">
      <div className="max-w-[1200px] mx-auto px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
          }}
          className="relative py-24 px-6 md:px-16 rounded-[32px] text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(20,184,166,0.05) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)"
          }}
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.15)_0%,transparent_70%)] pointer-events-none" />

          <h2 className="font-[var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-tight mb-5 relative">
            Ready to Experience{" "}
            <span className="gradient-text-alt">Personalized Medicine</span>?
          </h2>
          <p className="text-[1.1rem] text-text-secondary max-w-[580px] mx-auto mb-10 leading-relaxed relative">
            Join thousands of healthcare providers leveraging AI-driven genetic
            and medical data analysis for better patient outcomes.
          </p>
          <div className="flex justify-center gap-5 relative flex-col sm:flex-row items-center">
            <Link href="/prediction">
              <button className="btn-glow inline-flex items-center gap-2.5 px-10 py-5 rounded-[14px] text-white text-[1.05rem] font-semibold cursor-pointer group">
                <span>Get Started Now</span>
                <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
            <button className="inline-flex items-center gap-2.5 px-10 py-5 rounded-[14px] text-text-primary text-[1.05rem] font-semibold bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
              Contact Us
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
