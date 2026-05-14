"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Brain, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw 
} from "lucide-react";

/**
 * AIExplanation — Displays AI-powered explanation of a drug recommendation.
 * Auto-calls POST /api/explain when a prediction result is available.
 * Shows a loading spinner, the explanation text, SHAP feature bars, and disclaimer.
 */
export default function AIExplanation({ drugName, patientData, apiUrl }) {
  const [explanation, setExplanation] = useState(null);
  const [topFeatures, setTopFeatures] = useState(null);
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fetch explanation when drugName or patientData changes
  useEffect(() => {
    if (drugName && patientData) {
      fetchExplanation();
    }
  }, [drugName]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drug_name: drugName,
          patient_data: patientData,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate explanation");

      const data = await response.json();
      setExplanation(data.explanation);
      setTopFeatures(data.top_features);
      setDisclaimer(data.disclaimer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Compute max absolute SHAP value for bar scaling
  const maxAbsVal = topFeatures
    ? Math.max(...Object.values(topFeatures).map((v) => Math.abs(v)), 0.001)
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="ai-explain-card"
    >
      {/* Header */}
      <div className="ai-explain-header">
        <div className="ai-explain-icon-wrap">
          <Brain size={20} />
        </div>
        <div>
          <h3 className="ai-explain-title">AI Explanation</h3>
          <p className="ai-explain-subtitle">
            Powered by Google Gemini + SHAP Analysis
          </p>
        </div>
        {explanation && (
          <button onClick={fetchExplanation} className="ai-explain-refresh" title="Regenerate">
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Loading State */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-explain-loading"
          >
            <div className="ai-explain-spinner" />
            <p>Analyzing recommendation with AI...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ai-explain-error"
          >
            <AlertTriangle size={18} />
            <p>{error}</p>
            <button onClick={fetchExplanation} className="ai-explain-retry-btn">
              Retry
            </button>
          </motion.div>
        )}

        {/* Result State */}
        {explanation && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Explanation Text */}
            <div className="ai-explain-text">
              <Sparkles size={14} className="ai-explain-sparkle" />
              <p>{explanation}</p>
            </div>

            {/* SHAP Feature Importance Bars */}
            {drugName === "No Medication Required" ? (
              <div style={{marginTop: "12px", color: "#10b981", fontSize: "14px"}}>
                ✅ All clinical markers are within normal healthy ranges.
                No drug analysis required.
              </div>
            ) : topFeatures && Array.isArray(topFeatures) && topFeatures.length > 0 && (
              <div className="ai-shap-section">
                <h4 className="ai-shap-title">Top Contributing Features</h4>
                <div className="ai-shap-bars">
                  {topFeatures.map((item, idx) => {
                    const feature = item.feature;
                    const value = item.importance;
                    const absVal = Math.abs(value);
                    const pct = (absVal / (Math.max(...topFeatures.map(f => Math.abs(f.importance)), 0.001))) * 100;
                    const isPositive = value >= 0;
                    // Clean up feature names for display
                    const displayName = feature
                      .replace(/_/g, " ")
                      .replace(/([A-Z])/g, " $1")
                      .trim();

                    return (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="ai-shap-bar-row"
                      >
                        <div className="ai-shap-bar-label">
                          <span className="ai-shap-bar-name">{displayName}</span>
                          <span className={`ai-shap-bar-value ${isPositive ? "positive" : "negative"}`}>
                            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {value.toFixed(4)}
                          </span>
                        </div>
                        <div className="ai-shap-bar-track">
                          <motion.div
                            className={`ai-shap-bar-fill ${isPositive ? "positive" : "negative"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(pct, 3)}%` }}
                            transition={{ duration: 0.8, delay: 0.15 * idx, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            {disclaimer && (
              <p className="ai-explain-disclaimer">{disclaimer}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
