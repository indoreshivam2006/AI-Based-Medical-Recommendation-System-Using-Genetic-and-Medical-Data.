"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Pill,
  Syringe,
  Heart,
  Activity,
  ShieldCheck,
  Thermometer,
  Wind,
  Scale,
  CircleCheck,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  FlaskConical,
  Users,
  Stethoscope,
} from "lucide-react";

const ICON_MAP = {
  pill: Pill,
  syringe: Syringe,
  heart: Heart,
  activity: Activity,
  shield: ShieldCheck,
  thermometer: Thermometer,
  wind: Wind,
  scale: Scale,
  check: CircleCheck,
};

const CATEGORY_COLORS = {
  "Biguanide (Antidiabetic)": { bg: "rgba(99,102,241,0.12)", text: "#818CF8", border: "rgba(99,102,241,0.25)" },
  "Hormone (Antidiabetic)": { bg: "rgba(99,102,241,0.12)", text: "#818CF8", border: "rgba(99,102,241,0.25)" },
  "Calcium Channel Blocker": { bg: "rgba(239,68,68,0.10)", text: "#F87171", border: "rgba(239,68,68,0.25)" },
  "Angiotensin II Receptor Blocker (ARB)": { bg: "rgba(239,68,68,0.10)", text: "#F87171", border: "rgba(239,68,68,0.25)" },
  "Statin (HMG-CoA Reductase Inhibitor)": { bg: "rgba(251,191,36,0.10)", text: "#FBBF24", border: "rgba(251,191,36,0.25)" },
  "NSAID / Antiplatelet Agent": { bg: "rgba(0,212,170,0.10)", text: "#00D4AA", border: "rgba(0,212,170,0.25)" },
  "Antiplatelet Agent (P2Y12 Inhibitor)": { bg: "rgba(0,212,170,0.10)", text: "#00D4AA", border: "rgba(0,212,170,0.25)" },
  "Thyroid Hormone (Synthetic T4)": { bg: "rgba(168,85,247,0.10)", text: "#C084FC", border: "rgba(168,85,247,0.25)" },
  "Short-Acting Beta-Agonist (SABA) / Bronchodilator": { bg: "rgba(6,182,212,0.10)", text: "#22D3EE", border: "rgba(6,182,212,0.25)" },
  "Proton Pump Inhibitor (PPI)": { bg: "rgba(244,114,182,0.10)", text: "#F472B6", border: "rgba(244,114,182,0.25)" },
  "Lipase Inhibitor (Anti-Obesity)": { bg: "rgba(251,146,60,0.10)", text: "#FB923C", border: "rgba(251,146,60,0.25)" },
  "Analgesic / Antipyretic": { bg: "rgba(52,211,153,0.10)", text: "#34D399", border: "rgba(52,211,153,0.25)" },
  "Penicillin-class Antibiotic": { bg: "rgba(96,165,250,0.10)", text: "#60A5FA", border: "rgba(96,165,250,0.25)" },
  "No Medication Required": { bg: "rgba(148,163,184,0.08)", text: "#94A3B8", border: "rgba(148,163,184,0.2)" },
};

function getColor(drugClass) {
  return CATEGORY_COLORS[drugClass] || { bg: "rgba(99,102,241,0.10)", text: "#818CF8", border: "rgba(99,102,241,0.25)" };
}

function DrugCard({ name, drug, index }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[drug.icon] || Pill;
  const color = getColor(drug.class);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      layout
      className="group"
    >
      <motion.div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="relative rounded-[20px] overflow-hidden"
        animate={{
          borderColor: expanded ? color.border : "rgba(255,255,255,0.06)",
          y: expanded ? -5 : 0,
          boxShadow: expanded ? "0 20px 40px -10px rgba(0,0,0,0.4)" : "0 5px 10px -5px rgba(0,0,0,0)"
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "rgba(10, 10, 10, 0.6)",
          borderStyle: "solid",
          borderWidth: "1px",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${color.bg} 0%, transparent 70%)`,
          }}
        />

        {/* Header */}
        <div className="relative p-6 flex items-start gap-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 transition-transform duration-500 group-hover:scale-110"
            style={{ background: color.bg }}
          >
            <Icon size={22} style={{ color: color.text }} strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-[var(--font-display)] text-lg font-bold text-text-primary truncate">
                {name}
              </h3>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0"
              >
                <ChevronDown size={18} className="text-text-muted" />
              </motion.div>
            </div>

            <span
              className="inline-block mt-1.5 text-[0.7rem] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{
                background: color.bg,
                color: color.text,
                border: `1px solid ${color.border}`,
              }}
            >
              {drug.class}
            </span>

            <p className="text-[0.88rem] text-text-secondary mt-3 leading-relaxed line-clamp-2">
              {drug.description}
            </p>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-0 space-y-5">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Conditions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FlaskConical size={15} style={{ color: color.text }} />
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Conditions Treated
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {drug.conditions.map((condition) => (
                      <span
                        key={condition}
                        className="text-[0.78rem] font-medium px-3 py-1.5 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#d1d1e0",
                        }}
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Patient Type */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={15} style={{ color: color.text }} />
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Patient Profile
                    </span>
                  </div>
                  <p className="text-[0.88rem] text-text-secondary leading-relaxed pl-0.5">
                    {drug.patient_type}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function DrugSection() {
  const [drugs, setDrugs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const apiUrl = "https://ai-based-medical-recommendation-system.onrender.com";
    fetch(`${apiUrl}/drugs`)
      .then((res) => res.json())
      .then((data) => {
        setDrugs(data.drugs);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch drugs:", err);
        setError("Failed to load drug database");
        setLoading(false);
      });
  }, []);

  // Get unique categories
  const categories = drugs
    ? ["All", ...new Set(Object.values(drugs).map((d) => {
        // Simplify category names for filter buttons
        if (d.class.includes("Antidiabetic")) return "Diabetes";
        if (d.class.includes("Channel Blocker") || d.class.includes("ARB")) return "Blood Pressure";
        if (d.class.includes("Statin")) return "Cholesterol";
        if (d.class.includes("Antiplatelet") || d.class.includes("NSAID")) return "Heart / Blood";
        if (d.class.includes("Thyroid")) return "Thyroid";
        if (d.class.includes("Bronchodilator")) return "Respiratory";
        if (d.class.includes("Proton")) return "Gastric";
        if (d.class.includes("Obesity")) return "Weight";
        if (d.class.includes("Analgesic")) return "Pain / Fever";
        if (d.class.includes("Antibiotic")) return "Infection";
        if (d.class.includes("No Medication")) return "No Drug";
        return "Other";
      }))]
    : ["All"];

  // Filter drugs
  const filteredDrugs = drugs
    ? Object.entries(drugs).filter(([name, drug]) => {
        const matchesSearch =
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drug.conditions.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

        if (selectedCategory === "All") return matchesSearch;

        const drugCat = (() => {
          if (drug.class.includes("Antidiabetic")) return "Diabetes";
          if (drug.class.includes("Channel Blocker") || drug.class.includes("ARB")) return "Blood Pressure";
          if (drug.class.includes("Statin")) return "Cholesterol";
          if (drug.class.includes("Antiplatelet") || drug.class.includes("NSAID")) return "Heart / Blood";
          if (drug.class.includes("Thyroid")) return "Thyroid";
          if (drug.class.includes("Bronchodilator")) return "Respiratory";
          if (drug.class.includes("Proton")) return "Gastric";
          if (drug.class.includes("Obesity")) return "Weight";
          if (drug.class.includes("Analgesic")) return "Pain / Fever";
          if (drug.class.includes("Antibiotic")) return "Infection";
          if (drug.class.includes("No Medication")) return "No Drug";
          return "Other";
        })();

        return matchesSearch && drugCat === selectedCategory;
      })
    : [];

  return (
    <section id="drug-database" ref={sectionRef} className="relative z-[1] py-[120px]">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-accent-teal px-4 py-1.5 rounded-full bg-accent-teal/10 border border-accent-teal/20 mb-5 shadow-[0_0_15px_rgba(0,212,170,0.1)]">
            Drug Database
          </span>
          <h2 className="font-[var(--font-display)] text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight mb-4">
            <span className="gradient-text">{drugs ? Object.keys(drugs).length : 15}</span>{" "}
            <span className="text-text-primary">Drugs in Our Model</span>
          </h2>
          <p className="text-[1.05rem] text-text-secondary max-w-[620px] mx-auto leading-relaxed">
            Our AI model recommends from a curated database of{" "}
            {drugs ? Object.keys(drugs).length : 15} medications, each backed by
            clinical research and pharmacogenomic data.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 space-y-5"
        >
          {/* Search Bar */}
          <div className="relative max-w-[500px] mx-auto">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drugs, conditions, or descriptions..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm text-text-primary placeholder:text-text-muted outline-none transition-all duration-300 focus:border-accent-purple/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
              style={{
                background: "rgba(10, 10, 10, 0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[0.78rem] font-medium px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-accent-purple/20 text-accent-purple-light border border-accent-purple/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                    : "text-text-muted hover:text-text-secondary border border-transparent hover:border-white/10 hover:bg-white/[0.03]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex items-center gap-3 text-text-muted">
              <div className="w-5 h-5 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading drug database...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-text-muted text-xs mt-2">
              Make sure the backend server is running on port 8000
            </p>
          </div>
        )}

        {/* Drug Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filteredDrugs.map(([name, drug], index) => (
                  <DrugCard key={name} name={name} drug={drug} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {filteredDrugs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Search size={40} className="mx-auto text-text-muted/40 mb-4" />
                <p className="text-text-muted text-sm">
                  No drugs found matching &quot;{searchTerm}&quot;
                </p>
              </motion.div>
            )}

            {/* Data Source Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[0.75rem] text-text-muted"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Stethoscope size={14} className="text-accent-teal/60" />
                <span>
                  Drug information verified against NIH, Mayo Clinic, NHS &
                  medical literature
                </span>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
