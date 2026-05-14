"use client";

import "./prediction.css";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AIExplanation from "../components/AIExplanation";
import AIChatWidget from "../components/AIChatWidget";
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
  BookOpen,
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
function InputField({ label, name, value, onChange, type = "number", step, required = false, icon, placeholder = "" }) {
  return (
    <div className="pred-field-group">
      <label className="pred-label">{label}{required && <span style={{color:'#ef4444',marginLeft:2}}>*</span>}</label>
      <div className="pred-input-wrap">
        {icon && <span className="pred-input-icon">{icon}</span>}
        <input
          type={type}
          step={step}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder || `Enter ${label}`}
          className="pred-input"
          style={icon ? { paddingLeft: "2.5rem" } : {}}
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, icon, required = false, placeholder = "Select..." }) {
  return (
    <div className="pred-field-group">
      <label className="pred-label">{label}{required && <span style={{color:'#ef4444',marginLeft:2}}>*</span>}</label>
      <div className="pred-input-wrap">
        {icon && <span className="pred-input-icon">{icon}</span>}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`pred-select ${value === "" ? "pred-select-placeholder" : ""}`}
          style={icon ? { paddingLeft: "2.5rem" } : {}}
        >
          <option value="" disabled>{placeholder}</option>
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

function SliderField({ label, name, value, onChange, min = 0, max = 1, step = 0.05, hint }) {
  const numValue = value === "" ? 0.5 : parseFloat(value);
  const displayVal = typeof numValue === "number" ? numValue.toFixed(2) : "0.50";

  return (
    <div className="pred-field-group">
      <div className="flex items-center justify-between mb-1">
        <label className="pred-label" style={{ marginBottom: 0 }}>{label}</label>
        <span className="pred-slider-val">{displayVal}</span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={numValue}
        onChange={(e) => onChange({ target: { name, value: parseFloat(e.target.value) } })}
        style={{
          width: "100%",
          accentColor: "#06b6d4",
          cursor: "pointer",
          height: "6px",
        }}
      />
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ai-based-medical-recommendation-system.onrender.com";

export default function PredictionPage() {
  const [formData, setFormData] = useState({
    Age: "", Gender: "", BMI: "",
    eGFR: "", HbA1c: "", TSH: "", LDL_Cholesterol: "",
    Diabetes: "", Hypertension: "", Heart_Disease: "",
  });

  const [advancedData, setAdvancedData] = useState({
    Blood_Pressure: "", Heart_Rate: "", Cholesterol: "",
    Fasting_Glucose: "", WBC: "", ACR: "",
    Smoking_Status: "", Alcohol_Intake: "",
    Asthma: "", Thyroid: "", Infection: "", GERD_Flag: "", CAD_Flag: "",
    Genetic_Risk_Score: "", Genetic_Drug_Match_Score: "",
    Drug_Efficacy_Multiplier: "", Statin_Response_Score: "",
    Clopidogrel_Metabolism_Score: "", Hepatic_Metabolism_Rate: "",
    CYP2C19_Metabolism: "", Anti_Inflammatory_Response: "",
    Polygenic_Risk_Index: "", Genetic_Contraindication_Flag: "",
  });

  // Track which advanced fields the user has explicitly changed
  const [advancedTouched, setAdvancedTouched] = useState({});
  const [validationError, setValidationError] = useState(null);

  const [advancedMode, setAdvancedMode] = useState(false);

  const handleToggleAdvanced = () => {
    const nextMode = !advancedMode;
    setAdvancedMode(nextMode);

    if (nextMode) {
      setAdvancedData(prev => ({
        ...prev,
        Genetic_Drug_Match_Score: prev.Genetic_Drug_Match_Score === "" ? 0.5 : prev.Genetic_Drug_Match_Score,
        Drug_Efficacy_Multiplier: prev.Drug_Efficacy_Multiplier === "" ? 0.5 : prev.Drug_Efficacy_Multiplier,
        Statin_Response_Score: prev.Statin_Response_Score === "" ? 0.5 : prev.Statin_Response_Score,
        Clopidogrel_Metabolism_Score: prev.Clopidogrel_Metabolism_Score === "" ? 0.5 : prev.Clopidogrel_Metabolism_Score,
        Hepatic_Metabolism_Rate: prev.Hepatic_Metabolism_Rate === "" ? 0.5 : prev.Hepatic_Metabolism_Rate,
        Genetic_Risk_Score: prev.Genetic_Risk_Score === "" ? 0.5 : prev.Genetic_Risk_Score,
        Anti_Inflammatory_Response: prev.Anti_Inflammatory_Response === "" ? 0.5 : prev.Anti_Inflammatory_Response,
        Polygenic_Risk_Index: prev.Polygenic_Risk_Index === "" ? 0.5 : prev.Polygenic_Risk_Index,
      }));
    } else {
      setAdvancedData(prev => ({
        ...prev,
        Genetic_Drug_Match_Score: "",
        Drug_Efficacy_Multiplier: "",
        Statin_Response_Score: "",
        Clopidogrel_Metabolism_Score: "",
        Hepatic_Metabolism_Rate: "",
        Genetic_Risk_Score: "",
        Anti_Inflammatory_Response: "",
        Polygenic_Risk_Index: "",
      }));
    }
  };

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  // Check if all core fields are filled
  const coreFieldsFilled = (
    formData.Age !== "" &&
    formData.Gender !== "" &&
    formData.BMI !== "" &&
    formData.eGFR !== "" &&
    formData.HbA1c !== "" &&
    formData.TSH !== "" &&
    formData.LDL_Cholesterol !== "" &&
    formData.Diabetes !== "" &&
    formData.Hypertension !== "" &&
    formData.Heart_Disease !== ""
  );

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAdvancedChange = (e) => {
    setAdvancedData({ ...advancedData, [e.target.name]: e.target.value });
    setAdvancedTouched({ ...advancedTouched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    // Validate all core fields are filled
    if (!coreFieldsFilled) {
      setValidationError("Please fill in all required core fields before running the analysis.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Always include core fields
    const payload = {
      Age: Number(formData.Age), Gender: formData.Gender, BMI: Number(formData.BMI),
      eGFR: Number(formData.eGFR), HbA1c: Number(formData.HbA1c), TSH: Number(formData.TSH),
      LDL_Cholesterol: Number(formData.LDL_Cholesterol),
      Diabetes: Number(formData.Diabetes), Hypertension: Number(formData.Hypertension),
      Heart_Disease: Number(formData.Heart_Disease),
    };

    // Only add advanced fields if advanced mode is ON AND the user actually touched/filled them
    if (advancedMode) {
      const numericAdvanced = {
        Blood_Pressure: advancedData.Blood_Pressure,
        Heart_Rate: advancedData.Heart_Rate,
        Cholesterol: advancedData.Cholesterol,
        Fasting_Glucose: advancedData.Fasting_Glucose,
        WBC: advancedData.WBC,
        ACR: advancedData.ACR,
        Asthma: advancedData.Asthma,
        Thyroid: advancedData.Thyroid,
        Infection: advancedData.Infection,
        GERD_Flag: advancedData.GERD_Flag,
        CAD_Flag: advancedData.CAD_Flag,
        Genetic_Risk_Score: advancedData.Genetic_Risk_Score,
        Genetic_Drug_Match_Score: advancedData.Genetic_Drug_Match_Score,
        Drug_Efficacy_Multiplier: advancedData.Drug_Efficacy_Multiplier,
        Statin_Response_Score: advancedData.Statin_Response_Score,
        Clopidogrel_Metabolism_Score: advancedData.Clopidogrel_Metabolism_Score,
        Hepatic_Metabolism_Rate: advancedData.Hepatic_Metabolism_Rate,
        Anti_Inflammatory_Response: advancedData.Anti_Inflammatory_Response,
        Polygenic_Risk_Index: advancedData.Polygenic_Risk_Index,
        Genetic_Contraindication_Flag: advancedData.Genetic_Contraindication_Flag,
      };
      for (const [key, val] of Object.entries(numericAdvanced)) {
        if (advancedTouched[key] && val !== "") {
          payload[key] = Number(val);
        }
      }
      // String advanced fields
      const stringAdvanced = {
        Smoking_Status: advancedData.Smoking_Status,
        Alcohol_Intake: advancedData.Alcohol_Intake,
        CYP2C19_Metabolism: advancedData.CYP2C19_Metabolism,
      };
      for (const [key, val] of Object.entries(stringAdvanced)) {
        if (advancedTouched[key] && val !== "") {
          payload[key] = val;
        }
      }
    }

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to connect to AI engine");
      const data = await response.json();
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: build patientData object with only filled fields (for AI components)
  const buildFilledPatientData = () => {
    const data = {
      Age: Number(formData.Age), Gender: formData.Gender, BMI: Number(formData.BMI),
      eGFR: Number(formData.eGFR), HbA1c: Number(formData.HbA1c), TSH: Number(formData.TSH),
      LDL_Cholesterol: Number(formData.LDL_Cholesterol),
      Diabetes: Number(formData.Diabetes), Hypertension: Number(formData.Hypertension),
      Heart_Disease: Number(formData.Heart_Disease),
    };
    if (advancedMode) {
      for (const [key, val] of Object.entries(advancedData)) {
        if (advancedTouched[key] && val !== "") {
          const stringFields = ["Smoking_Status", "Alcohol_Intake", "CYP2C19_Metabolism"];
          data[key] = stringFields.includes(key) ? val : Number(val);
        }
      }
    }
    return data;
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
                  <InputField label="Age" name="Age" value={formData.Age} onChange={handleChange} required placeholder="e.g. 45" />
                  <SelectField
                    label="Gender"
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleChange}
                    required
                    options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                    ]}
                  />
                  <InputField label="BMI" name="BMI" value={formData.BMI} onChange={handleChange} step="0.1" required placeholder="e.g. 26.5" />
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
                      required
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
                  onClick={handleToggleAdvanced}
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

              {/* ── Validation Message ── */}
              {validationError && (
                <div className="pred-validation-error">
                  <AlertCircle size={16} />
                  <span>{validationError}</span>
                </div>
              )}

              {/* ── Submit ── */}
              <div className="pred-submit-area">
                <button
                  type="submit"
                  disabled={loading || !coreFieldsFilled}
                  className={`pred-submit-btn ${loading ? "loading" : ""} ${!coreFieldsFilled ? "disabled" : ""}`}
                  title={!coreFieldsFilled ? "Please fill all required fields" : ""}
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
                {!coreFieldsFilled && (
                  <p className="pred-submit-hint">Fill all required (*) fields to enable analysis</p>
                )}
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

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setResult(null)}
                      className="pred-reset-btn"
                    >
                      <Activity size={14} />
                      New Analysis
                    </button>
                    <Link href="/knowledge-base" className="pred-reset-btn" style={{ textDecoration: 'none' }}>
                      <BookOpen size={14} />
                      Drug Knowledge Base
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ════════════ AI SECTION (Explanation + Chat) ════════════ */}
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pred-ai-section"
            >
              <AIExplanation
                drugName={result.prediction}
                patientData={buildFilledPatientData()}
                apiUrl={API_URL}
              />
              <AIChatWidget
                drugName={result.prediction}
                patientData={buildFilledPatientData()}
                apiUrl={API_URL}
              />
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
