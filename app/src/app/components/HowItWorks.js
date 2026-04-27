"use client";

import { motion } from "framer-motion";

const steps = [
  {
    id: "step1",
    number: "01",
    title: "Upload Your Data",
    desc: "Securely upload your genetic data and medical history. We support multiple data formats and lab report types.",
  },
  {
    id: "step2",
    number: "02",
    title: "AI Analyzes",
    desc: "Our deep learning models analyze your genetic markers against a vast medical knowledge base in real time.",
  },
  {
    id: "step3",
    number: "03",
    title: "Get Recommendations",
    desc: "Receive personalized treatment recommendations, drug interactions, and preventive care insights.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function StepCard({ step }) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative p-10 rounded-[20px] glass-card transition-colors duration-400 text-center group hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:border-accent-purple/20"
    >
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="font-[var(--font-display)] text-[3.5rem] font-extrabold leading-none mb-5 gradient-text-alt opacity-40 group-hover:opacity-80 transition-opacity duration-400">
        {step.number}
      </div>
      <h3 className="font-[var(--font-display)] text-xl font-bold mb-3 text-text-primary">
        {step.title}
      </h3>
      <p className="text-[0.95rem] text-text-secondary leading-relaxed">{step.desc}</p>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative z-[1] py-[120px]"
      style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.02) 50%, transparent 100%)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
          }}
          className="text-center mb-[72px]"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-accent-cyan px-4 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 mb-5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            Process
          </span>
          <h2 className="font-[var(--font-display)] text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight mb-4">
            How It <span className="gradient-text-alt">Works</span>
          </h2>
          <p className="text-[1.05rem] text-text-secondary max-w-[560px] mx-auto leading-relaxed">
            Three simple steps to receive your personalized medical recommendations.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[calc(33.33%+16px)] w-[calc(33.33%-32px)] h-[2px] -translate-y-1/2 bg-gradient-to-r from-accent-purple/30 to-accent-teal/30 opacity-30" />
          <div className="hidden md:block absolute top-1/2 left-[calc(66.66%+16px)] w-[calc(33.33%-64px)] h-[2px] -translate-y-1/2 bg-gradient-to-r from-accent-teal/30 to-accent-cyan/30 opacity-30" />

          {steps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
