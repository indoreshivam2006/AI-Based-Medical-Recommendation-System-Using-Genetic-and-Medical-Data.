"use client";

import { motion } from "framer-motion";
import { Dna, ClipboardList, BrainCircuit, ShieldCheck } from "lucide-react";

const features = [
  {
    id: "featureGenetic",
    title: "Genetic Analysis",
    desc: "Deep analysis of genetic markers, SNPs, and genomic variations to understand your unique biological profile.",
    iconBg: "bg-accent-purple/10 text-accent-purple",
    icon: Dna,
  },
  {
    id: "featureMedical",
    title: "Medical Data Integration",
    desc: "Seamlessly integrates patient medical history, lab results, and clinical data for comprehensive analysis.",
    iconBg: "bg-accent-purple-light/10 text-accent-purple-light",
    icon: ClipboardList,
  },
  {
    id: "featureAI",
    title: "AI-Powered Predictions",
    desc: "Advanced machine learning models trained on vast datasets to deliver accurate, personalized recommendations.",
    iconBg: "bg-accent-teal/10 text-accent-teal",
    icon: BrainCircuit,
  },
  {
    id: "featureSecurity",
    title: "Secure & Private",
    desc: "Enterprise-grade encryption protects your genetic and medical data. HIPAA compliant and fully secure.",
    iconBg: "bg-accent-cyan/10 text-accent-cyan",
    icon: ShieldCheck,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.01 }}
      className="relative p-9 rounded-[20px] glass-card transition-colors duration-400 overflow-hidden group hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:border-accent-purple/20"
    >
      <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${feature.iconBg} mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[5deg]`}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3 className="font-[var(--font-display)] text-xl font-bold mb-3 text-text-primary">
        {feature.title}
      </h3>
      <p className="text-[0.95rem] text-text-secondary leading-relaxed">{feature.desc}</p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative z-[1] py-[120px]">
      <div className="max-w-[1200px] mx-auto px-8">
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
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-accent-purple px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-5 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            Features
          </span>
          <h2 className="font-[var(--font-display)] text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight mb-4">
            Built for <span className="gradient-text-alt">Precision Medicine</span>
          </h2>
          <p className="text-[1.05rem] text-text-secondary max-w-[560px] mx-auto leading-relaxed">
            Our AI analyzes complex genetic markers and medical data to deliver
            recommendations tailored specifically to you.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
