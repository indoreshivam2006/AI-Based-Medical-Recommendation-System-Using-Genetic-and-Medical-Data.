"use client";

import "./knowledge-base.css";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  ArrowLeft,
  Sparkles,
  FileText,
  Loader2,
  AlertTriangle,
  Pill,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ai-based-medical-recommendation-system.onrender.com";

/**
 * Drug Knowledge Base Page — Search drug information using RAG.
 * Calls POST /api/rag-search and displays the AI-generated answer
 * along with the source documents used.
 */
export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);

    try {
      const response = await fetch(`${API_URL}/api/rag-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query.trim() }),
      });

      if (!response.ok) throw new Error("Failed to search the knowledge base");

      const data = await response.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Suggested queries for quick access
  const suggestions = [
    "What are the side effects of Metformin?",
    "How does Clopidogrel work?",
    "When is Insulin prescribed?",
    "What is Atorvastatin used for?",
    "Tell me about Levothyroxine",
    "What is the difference between Aspirin and Clopidogrel?",
  ];

  return (
    <main className="kb-page">
      {/* Background */}
      <div className="kb-bg">
        <div className="kb-bg-orb kb-bg-orb-1" />
        <div className="kb-bg-orb kb-bg-orb-2" />
        <div className="kb-bg-grid" />
      </div>

      <div className="kb-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="kb-header"
        >
          <Link href="/prediction" className="kb-back-link">
            <ArrowLeft size={18} />
            <span>Back to Prediction</span>
          </Link>

          <div className="kb-hero">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="kb-hero-icon"
            >
              <BookOpen size={28} />
            </motion.div>
            <h1 className="kb-hero-title">
              <span className="kb-hero-title-accent">Drug</span> Knowledge Base
            </h1>
            <p className="kb-hero-desc">
              Search our AI-powered medical knowledge base for information about
              drugs, their mechanisms, and side effects. Powered by{" "}
              <strong>RAG + Google Gemini</strong>.
            </p>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="kb-search-card"
        >
          <form onSubmit={handleSearch} className="kb-search-form">
            <div className="kb-search-input-wrap">
              <Search size={20} className="kb-search-icon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search drug information..."
                className="kb-search-input"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="kb-search-btn"
            >
              {loading ? (
                <Loader2 size={18} className="kb-spin" />
              ) : (
                <>
                  <Sparkles size={18} />
                  Search
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestions */}
          {!answer && !loading && (
            <div className="kb-suggestions">
              <p className="kb-suggestions-label">Try asking:</p>
              <div className="kb-suggestions-grid">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    onClick={() => {
                      setQuery(s);
                    }}
                    className="kb-suggestion-chip"
                  >
                    <Pill size={12} />
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {/* Loading */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="kb-result-card"
            >
              <div className="kb-loading">
                <div className="kb-loading-spinner" />
                <p>Searching knowledge base and generating answer...</p>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="kb-result-card"
            >
              <div className="kb-error">
                <AlertTriangle size={24} />
                <p>{error}</p>
                <button onClick={handleSearch} className="kb-retry-btn">
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* Answer */}
          {answer && !loading && (
            <motion.div
              key="answer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="kb-result-card"
            >
              <div className="kb-answer-header">
                <Sparkles size={16} className="kb-answer-icon" />
                <h3>AI-Generated Answer</h3>
              </div>
              <div className="kb-answer-text">
                <p>{answer}</p>
              </div>

              {/* Source Documents */}
              {sources.length > 0 && (
                <div className="kb-sources">
                  <div className="kb-sources-label">
                    <FileText size={14} />
                    <span>Source documents used:</span>
                  </div>
                  <div className="kb-sources-list">
                    {sources.map((source, i) => (
                      <span key={i} className="kb-source-tag">
                        <Pill size={10} />
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
