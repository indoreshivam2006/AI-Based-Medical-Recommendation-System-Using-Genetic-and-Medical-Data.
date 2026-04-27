"use client";

import "./prediction.css";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  Dna,
  FileHeart,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Beaker,
  CheckCircle2,
  FlaskConical,
  HeartPulse,
  Cigarette,
  Microscope,
  Shield,
  Sparkles,
  TrendingUp,
  Gauge,
  Zap,
  Brain,
  Pill,
  AlertCircle,
  BarChart3,
  Layers,
  Atom,
  ShieldCheck,
  Clock,
  Target,
} from "lucide-react";
import Link from "next/link";

/* ──────────── Animated Confidence Ring ──────────── */
function ConfidenceRing({ value, size = 140 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const color =
    value >= 80
      ? "#10b981"
      : value >= 60
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-black text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          {value}%
        </motion.span>
        <span className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
          Confidence
        </span>
      </div>
    </div>
  );
}

/* ──────────── Styled Components ──────────── */
function InputField({ label, name, value, onChange, type = "number", step, required = false, icon }) {
  return (
    <div className="pred-field-group">
      <label className="pred-label">{label}</label>
      <div className="pred-input-wrap">
        {icon && <span className="pred-input-icon">{icon}</span>}
        <input
          type={type}
          step={step}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="pred-input"
          style={icon ? { paddingLeft: "2.5rem" } : {}}
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, icon }) {
  return (
    <div className="pred-field-group">
      <label className="pred-label">{label}</label>
      <div className="pred-input-wrap">
        {icon && <span className="pred-input-icon">{icon}</span>}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="pred-select"
          style={icon ? { paddingLeft: "2.5rem" } : {}}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function SliderField({ label, name, value, onChange, min = 0, max = 1, step = 0.01, hint }) {
  const displayVal = value === "" ? "—" : Number(value).toFixed(2);
  const pct = value === "" ? 50 : ((value - min) / (max - min)) * 100;
  return (
    <div className="pred-field-group">
      <div className="flex items-center justify-between mb-1">
        <label className="pred-label" style={{ marginBottom: 0 }}>{label}</label>
        <span className="pred-slider-val">{displayVal}</span>
      </div>
      <div className="pred-slider-track-wrap">
        <div className="pred-slider-track-bg">
          <div className="pred-slider-track-fill" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          name={name}
          value={value === "" ? (max - min) / 2 + min : value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className="pred-slider-input"
        />
      </div>
      {hint && <p className="pred-slider-hint">{hint}</p>}
    </div>
  );
}

/* ──────────── Collapsible Section ──────────── */
function Section({ icon, title, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pred-section">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="pred-section-header"
      >
        <div className="pred-section-icon">{icon}</div>
        <span className="pred-section-title">{title}</span>
        {badge && <span className="pred-section-badge">{badge}</span>}
        <ChevronDown
          size={16}
          className={`pred-section-chevron ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pred-section-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────── Step Indicator ──────────── */
function StepIndicator({ steps, current }) {
  return (
    <div className="pred-steps">
      {steps.map((s, i) => (
        <div key={i} className={`pred-step ${i <= current ? "active" : ""}`}>
          <div className="pred-step-dot">
            {i < current ? (
              <CheckCircle2 size={14} />
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span className="pred-step-label">{s}</span>
          {i < steps.length - 1 && <div className="pred-step-line" />}
        </div>
      ))}
    </div>
  );
}

/* ──────────── Quality Badge ──────────── */
const QUALITY_MAP = {
  Basic: { color: "#f59e0b", label: "Basic", icon: <Layers size={14} /> },
  Enhanced: { color: "#3b82f6", label: "Enhanced", icon: <BarChart3 size={14} /> },
  Precision: { color: "#10b981", label: "Precision", icon: <Target size={14} /> },
};

/* ════════════════════════════════════════════════════════════════ */
/*                       MAIN COMPONENT                           */
/* ════════════════════════════════════════════════════════════════ */

export default function PredictionPage() {
  const [formData, setFormData] = useState({
    Age: 45, Gender: "Male", BMI: 26.5,
    eGFR: 90.0, HbA1c: 5.5, TSH: 2.0, LDL_Cholesterol: 100.0,
    Diabetes: "0", Hypertension: "0", Heart_Disease: "0",
  });

  const [advancedData, setAdvancedData] = useState({
    Blood_Pressure: 120, Heart_Rate: 75, Cholesterol: 200,
    Fasting_Glucose: 95, WBC: 7.0, ACR: 20.0,
    Smoking_Status: "Never", Alcohol_Intake: "None",
    Asthma: "0", Thyroid: "0", Infection: "0", GERD_Flag: "0", CAD_Flag: "0",
    Genetic_Risk_Score: 0.5, Genetic_Drug_Match_Score: 0.8,
    Drug_Efficacy_Multiplier: 0.8, Statin_Response_Score: 0.75,
    Clopidogrel_Metabolism_Score: 0.6, Hepatic_Metabolism_Rate: 0.9,
    CYP2C19_Metabolism: "Intermediate", Anti_Inflammatory_Response: 0.75,
    Polygenic_Risk_Index: 0.5, Genetic_Contraindication_Flag: "0",
  });

  const [advancedMode, setAdvancedMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAdvancedChange = (e) => setAdvancedData({ ...advancedData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      Age: Number(formData.Age), Gender: formData.Gender, BMI: Number(formData.BMI),
      eGFR: Number(formData.eGFR), HbA1c: Number(formData.HbA1c), TSH: Number(formData.TSH),
      LDL_Cholesterol: Number(formData.LDL_Cholesterol),
      Diabetes: Number(formData.Diabetes), Hypertension: Number(formData.Hypertension),
      Heart_Disease: Number(formData.Heart_Disease),
    };

    if (advancedMode) {
      Object.assign(payload, {
        Blood_Pressure: Number(advancedData.Blood_Pressure),
        Heart_Rate: Number(advancedData.Heart_Rate),
        Cholesterol: Number(advancedData.Cholesterol),
        Fasting_Glucose: Number(advancedData.Fasting_Glucose),
        WBC: Number(advancedData.WBC), ACR: Number(advancedData.ACR),
        Smoking_Status: advancedData.Smoking_Status,
        Alcohol_Intake: advancedData.Alcohol_Intake,
        Asthma: Number(advancedData.Asthma), Thyroid: Number(advancedData.Thyroid),
        Infection: Number(advancedData.Infection),
        GERD_Flag: Number(advancedData.GERD_Flag), CAD_Flag: Number(advancedData.CAD_Flag),
        Genetic_Risk_Score: Number(advancedData.Genetic_Risk_Score),
        Genetic_Drug_Match_Score: Number(advancedData.Genetic_Drug_Match_Score),
        Drug_Efficacy_Multiplier: Number(advancedData.Drug_Efficacy_Multiplier),
        Statin_Response_Score: Number(advancedData.Statin_Response_Score),
        Clopidogrel_Metabolism_Score: Number(advancedData.Clopidogrel_Metabolism_Score),
        Hepatic_Metabolism_Rate: Number(advancedData.Hepatic_Metabolism_Rate),
        CYP2C19_Metabolism: advancedData.CYP2C19_Metabolism,
        Anti_Inflammatory_Response: Number(advancedData.Anti_Inflammatory_Response),
        Polygenic_Risk_Index: Number(advancedData.Polygenic_Risk_Index),
        Genetic_Contraindication_Flag: Number(advancedData.Genetic_Contraindication_Flag),
      });
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to connect to AI engine");
      const data = await response.json();
      setResult(data);
      // Scroll to result on mobile
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const featureCount = advancedMode ? 33 : 10;
  const totalFeatures = 49;
  const featurePct = Math.round((featureCount / totalFeatures) * 100);

  const steps = advancedMode
    ? ["Biometrics", "Clinical", "History", "Vitals", "Lifestyle", "Genetic"]
    : ["Biometrics", "Clinical", "History"];

  return (
    <main className="pred-page">
      {/* ── Mesh gradient background ── */}
      <div className="pred-bg">
        <div className="pred-bg-orb pred-bg-orb-1" />
        <div className="pred-bg-orb pred-bg-orb-2" />
        <div className="pred-bg-orb pred-bg-orb-3" />
        <div className="pred-bg-grid" />
      </div>

      <div className="pred-container">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pred-header"
        >
          <Link href="/" className="pred-back-link">
            <ArrowLeft size={18} />
            <span>Home</span>
          </Link>

          <div className="pred-hero">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="pred-hero-icon"
            >
              <Brain size={28} />
            </motion.div>
            <h1 className="pred-hero-title">
              <span className="pred-hero-title-ai">AI</span> Precision Medicine
            </h1>
            <p className="pred-hero-desc">
              Pharmacogenomic-powered drug recommendation engine analyzing{" "}
              <strong>{totalFeatures} clinical markers</strong> against 50,000+ patient profiles
            </p>
          </div>

          {/* Feature gauge */}
          <div className="pred-feature-gauge">
            <div className="pred-feature-gauge-bar">
              <motion.div
                className="pred-feature-gauge-fill"
                initial={false}
                animate={{ width: `${featurePct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="pred-feature-gauge-info">
              <Gauge size={12} />
              <span>
                <strong>{featureCount}</strong> / {totalFeatures} features active
              </span>
              {!advancedMode && (
                <span className="pred-feature-gauge-hint">
                  Enable Advanced for +23
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="pred-grid">
          {/* ════════════ INPUT FORM ════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="pred-form-card"
          >
            <form onSubmit={handleSubmit}>
              {/* Section 1: Biometrics */}
              <Section
                icon={<Activity size={18} />}
                title="Patient Biometrics"
                badge="Core"
                defaultOpen={true}
              >
                <div className="pred-grid-3">
                  <InputField label="Age" name="Age" value={formData.Age} onChange={handleChange} required />
                  <SelectField
                    label="Gender"
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleChange}
                    options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                    ]}
                  />
                  <InputField label="BMI" name="BMI" value={formData.BMI} onChange={handleChange} step="0.1" required />
                </div>
              </Section>

              {/* Section 2: Clinical */}
              <Section
                icon={<FlaskConical size={18} />}
                title="Clinical Markers"
                badge="Core"
              >
                <div className="pred-grid-2">
                  <InputField label="eGFR (Kidney)" name="eGFR" value={formData.eGFR} onChange={handleChange} step="0.1" required />
                  <InputField label="HbA1c (Blood Sugar)" name="HbA1c" value={formData.HbA1c} onChange={handleChange} step="0.1" required />
                  <InputField label="TSH (Thyroid)" name="TSH" value={formData.TSH} onChange={handleChange} step="0.1" required />
                  <InputField label="LDL Cholesterol" name="LDL_Cholesterol" value={formData.LDL_Cholesterol} onChange={handleChange} step="0.1" required />
                </div>
              </Section>

              {/* Section 3: Medical History */}
              <Section
                icon={<FileHeart size={18} />}
                title="Medical History"
                badge="Core"
              >
                <div className="pred-grid-3">
                  {[
                    { name: "Diabetes", label: "Diabetes" },
                    { name: "Hypertension", label: "Hypertension" },
                    { name: "Heart_Disease", label: "Heart Disease" },
                  ].map((flag) => (
                    <SelectField
                      key={flag.name}
                      label={flag.label}
                      name={flag.name}
                      value={formData[flag.name]}
                      onChange={handleChange}
                      options={[
                        { value: "0", label: "No" },
                        { value: "1", label: "Yes" },
                      ]}
                    />
                  ))}
                </div>
              </Section>

              {/* ════════════ ADVANCED TOGGLE ════════════ */}
              <div className="pred-advanced-toggle-wrap">
                <button
                  type="button"
                  onClick={() => setAdvancedMode(!advancedMode)}
                  className="pred-advanced-toggle"
                >
                  <div className={`pred-toggle-switch ${advancedMode ? "on" : ""}`}>
                    <div className="pred-toggle-dot" />
                  </div>
                  <div className="pred-toggle-text">
                    <span className="pred-toggle-title">
                      Advanced Mode
                      {advancedMode && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="pred-toggle-badge"
                        >
                          +23 Features
                        </motion.span>
                      )}
                    </span>
                    <span className="pred-toggle-subtitle">
                      {advancedMode
                        ? "Vitals, lifestyle, genetic & pharmacogenomic profiling"
                        : "Unlock precision predictions with 23 additional markers"}
                    </span>
                  </div>
                  <Sparkles
                    size={18}
                    className={`pred-toggle-sparkle ${advancedMode ? "active" : ""}`}
                  />
                </button>
              </div>

              {/* ════════════ ADVANCED SECTIONS ════════════ */}
              <AnimatePresence>
                {advancedMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    {/* Vitals & Labs */}
                    <Section
                      icon={<HeartPulse size={18} />}
                      title="Vital Signs & Labs"
                      badge="Advanced"
                    >
                      <div className="pred-grid-3">
                        <InputField label="Blood Pressure (Systolic)" name="Blood_Pressure" value={advancedData.Blood_Pressure} onChange={handleAdvancedChange} />
                        <InputField label="Heart Rate (BPM)" name="Heart_Rate" value={advancedData.Heart_Rate} onChange={handleAdvancedChange} />
                        <InputField label="Total Cholesterol" name="Cholesterol" value={advancedData.Cholesterol} onChange={handleAdvancedChange} />
                        <InputField label="Fasting Glucose (mg/dL)" name="Fasting_Glucose" value={advancedData.Fasting_Glucose} onChange={handleAdvancedChange} />
                        <InputField label="WBC Count" name="WBC" value={advancedData.WBC} onChange={handleAdvancedChange} step="0.1" />
                        <InputField label="ACR (Albumin-Creatinine)" name="ACR" value={advancedData.ACR} onChange={handleAdvancedChange} step="0.1" />
                      </div>
                    </Section>

                    {/* Lifestyle */}
                    <Section
                      icon={<Cigarette size={18} />}
                      title="Lifestyle Profile"
                      badge="Advanced"
                    >
                      <div className="pred-grid-2">
                        <SelectField
                          label="Smoking Status"
                          name="Smoking_Status"
                          value={advancedData.Smoking_Status}
                          onChange={handleAdvancedChange}
                          options={[
                            { value: "Never", label: "Never" },
                            { value: "Former", label: "Former" },
                            { value: "Current", label: "Current" },
                          ]}
                        />
                        <SelectField
                          label="Alcohol Intake"
                          name="Alcohol_Intake"
                          value={advancedData.Alcohol_Intake}
                          onChange={handleAdvancedChange}
                          options={[
                            { value: "None", label: "None" },
                            { value: "Light", label: "Light" },
                            { value: "Moderate", label: "Moderate" },
                            { value: "Heavy", label: "Heavy" },
                          ]}
                        />
                      </div>
                    </Section>

                    {/* Conditions */}
                    <Section
                      icon={<Shield size={18} />}
                      title="Condition Flags"
                      badge="Advanced"
                    >
                      <div className="pred-grid-5">
                        {[
                          { name: "Asthma", label: "Asthma" },
                          { name: "Thyroid", label: "Thyroid" },
                          { name: "Infection", label: "Infection" },
                          { name: "GERD_Flag", label: "GERD" },
                          { name: "CAD_Flag", label: "CAD" },
                        ].map((flag) => (
                          <SelectField
                            key={flag.name}
                            label={flag.label}
                            name={flag.name}
                            value={advancedData[flag.name]}
                            onChange={handleAdvancedChange}
                            options={[
                              { value: "0", label: "No" },
                              { value: "1", label: "Yes" },
                            ]}
                          />
                        ))}
                      </div>
                    </Section>

                    {/* Genetic */}
                    <Section
                      icon={<Dna size={18} />}
                      title="Pharmacogenomic Profile"
                      badge="Precision"
                    >
                      <div className="pred-genetic-notice">
                        <Atom size={14} />
                        <p>
                          <strong>Highest-impact features.</strong> These pharmacogenomic scores have
                          the strongest influence on drug selection. Adjust based on genetic test results.
                        </p>
                      </div>
                      <div className="pred-grid-2">
                        <SliderField label="Drug Match Score" name="Genetic_Drug_Match_Score" value={advancedData.Genetic_Drug_Match_Score} onChange={handleAdvancedChange} hint="Gene-drug compatibility (0 = poor, 1 = optimal)" />
                        <SliderField label="Drug Efficacy" name="Drug_Efficacy_Multiplier" value={advancedData.Drug_Efficacy_Multiplier} onChange={handleAdvancedChange} hint="Expected drug effectiveness" />
                        <SliderField label="Statin Response" name="Statin_Response_Score" value={advancedData.Statin_Response_Score} onChange={handleAdvancedChange} hint="Genetic statin therapy response" />
                        <SliderField label="Clopidogrel Metabolism" name="Clopidogrel_Metabolism_Score" value={advancedData.Clopidogrel_Metabolism_Score} onChange={handleAdvancedChange} hint="CYP2C19-based antiplatelet metabolism" />
                        <SliderField label="Hepatic Metabolism" name="Hepatic_Metabolism_Rate" value={advancedData.Hepatic_Metabolism_Rate} onChange={handleAdvancedChange} hint="Liver drug processing speed" />
                        <SliderField label="Genetic Risk Score" name="Genetic_Risk_Score" value={advancedData.Genetic_Risk_Score} onChange={handleAdvancedChange} hint="Overall polygenic disease risk" />
                        <SliderField label="Anti-inflammatory Response" name="Anti_Inflammatory_Response" value={advancedData.Anti_Inflammatory_Response} onChange={handleAdvancedChange} hint="Genetic anti-inflammatory capacity" />
                        <SliderField label="Polygenic Risk Index" name="Polygenic_Risk_Index" value={advancedData.Polygenic_Risk_Index} onChange={handleAdvancedChange} hint="Combined multi-gene risk" />
                      </div>
                      <div className="pred-grid-2" style={{ marginTop: "1rem" }}>
                        <SelectField
                          label="CYP2C19 Metabolism"
                          name="CYP2C19_Metabolism"
                          value={advancedData.CYP2C19_Metabolism}
                          onChange={handleAdvancedChange}
                          options={[
                            { value: "Poor", label: "Poor Metabolizer" },
                            { value: "Intermediate", label: "Intermediate" },
                            { value: "Normal", label: "Normal" },
                            { value: "Rapid", label: "Rapid Metabolizer" },
                          ]}
                        />
                        <SelectField
                          label="Genetic Contraindication"
                          name="Genetic_Contraindication_Flag"
                          value={advancedData.Genetic_Contraindication_Flag}
                          onChange={handleAdvancedChange}
                          options={[
                            { value: "0", label: "None" },
                            { value: "1", label: "Flagged" },
                          ]}
                        />
                      </div>
                    </Section>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Submit ── */}
              <div className="pred-submit-area">
                <button
                  type="submit"
                  disabled={loading}
                  className={`pred-submit-btn ${loading ? "loading" : ""}`}
                >
                  {loading ? (
                    <div className="pred-spinner" />
                  ) : (
                    <>
                      <Zap size={20} />
                      Run Analysis
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* ════════════ RESULTS PANEL ════════════ */}
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pred-result-card"
          >
            <AnimatePresence mode="wait">
              {/* Idle */}
              {!result && !error && !loading && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pred-result-idle"
                >
                  <div className="pred-idle-visual">
                    <div className="pred-idle-ring" />
                    <div className="pred-idle-ring delay-1" />
                    <div className="pred-idle-ring delay-2" />
                    <Brain size={32} className="pred-idle-icon" />
                  </div>
                  <h3 className="pred-idle-title">Ready to Analyze</h3>
                  <p className="pred-idle-desc">
                    Configure patient data and run the analysis.
                    The AI will process{" "}
                    <strong className="text-white">{featureCount} features</strong> to recommend optimal treatment.
                  </p>
                  <div className="pred-idle-chips">
                    <span className="pred-chip"><ShieldCheck size={12} /> HIPAA Compliant</span>
                    <span className="pred-chip"><Clock size={12} /> ~2s Inference</span>
                    <span className="pred-chip"><Atom size={12} /> ML-Powered</span>
                  </div>
                </motion.div>
              )}

              {/* Loading */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pred-result-loading"
                >
                  <div className="pred-loading-visual">
                    <div className="pred-loading-orbit" />
                    <div className="pred-loading-orbit orbit-2" />
                    <Dna size={28} className="pred-loading-icon" />
                  </div>
                  <h3 className="pred-loading-title">Analyzing Patient Profile</h3>
                  <div className="pred-loading-steps">
                    {["Cross-referencing markers", "Running pharmacogenomics", "Computing drug match"].map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.5 }}
                        className="pred-loading-step"
                      >
                        <div className="pred-loading-step-dot" />
                        <span>{s}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="pred-result-error"
                >
                  <div className="pred-error-icon-wrap">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="pred-error-title">Connection Error</h3>
                  <p className="pred-error-desc">{error}</p>
                  <p className="pred-error-hint">Ensure the FastAPI backend is running on port 8000.</p>
                  <button
                    onClick={() => setError(null)}
                    className="pred-error-btn"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}

              {/* Result */}
              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="pred-result-success"
                >
                  {/* Quality + Status */}
                  <div className="pred-result-header">
                    {result.quality && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pred-quality-badge"
                        style={{ "--q-color": QUALITY_MAP[result.quality]?.color || "#f59e0b" }}
                      >
                        {QUALITY_MAP[result.quality]?.icon}
                        {QUALITY_MAP[result.quality]?.label || "Basic"} Prediction
                      </motion.div>
                    )}
                    <div className="pred-status-dot" />
                    <span className="pred-status-text">Analysis Complete</span>
                  </div>

                  {/* Drug Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pred-drug-card"
                  >
                    <div className="pred-drug-label">
                      <Pill size={14} />
                      Recommended Treatment
                    </div>
                    <h2 className="pred-drug-name">{result.prediction}</h2>
                    <div className="pred-drug-glow" />
                  </motion.div>

                  {/* Confidence Ring */}
                  <div className="pred-confidence-wrap">
                    <ConfidenceRing value={result.confidence} />
                  </div>

                  {/* Stats */}
                  <div className="pred-stats-grid">
                    <div className="pred-stat">
                      <span className="pred-stat-label">Model</span>
                      <span className="pred-stat-value">Random Forest</span>
                    </div>
                    <div className="pred-stat">
                      <span className="pred-stat-label">Features Used</span>
                      <span className="pred-stat-value">
                        {result.features_provided || featureCount} / {result.features_total || totalFeatures}
                      </span>
                    </div>
                  </div>

                  {/* Feature bar */}
                  {result.features_provided && (
                    <div className="pred-feature-bar-wrap">
                      <div className="pred-feature-bar-bg">
                        <motion.div
                          className="pred-feature-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${(result.features_provided / result.features_total) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <p className="pred-feature-bar-hint">
                        {QUALITY_MAP[result.quality]?.label || "Basic"} tier — {result.quality === "Precision" ? "maximum" : "enable Advanced Mode for higher"} accuracy
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setResult(null)}
                    className="pred-reset-btn"
                  >
                    <Activity size={14} />
                    New Analysis
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
