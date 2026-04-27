export default function Footer() {
  return (
    <footer id="footer" className="relative z-[1] pt-16 pb-8 border-t border-white/6">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Top */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-12">
          {/* Brand */}
          <div className="max-w-[300px]">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="url(#logoGradF)" strokeWidth="2" />
                <path
                  d="M9 14C9 14 11 9 14 9C17 9 19 14 19 14C19 14 17 19 14 19C11 19 9 14 9 14Z"
                  fill="url(#logoGradF)"
                />
                <circle cx="14" cy="14" r="3" fill="#0a0a0f" />
                <defs>
                  <linearGradient id="logoGradF" x1="0" y1="0" x2="28" y2="28">
                    <stop offset="0%" stopColor="#6C63FF" />
                    <stop offset="100%" stopColor="#00D4AA" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-[var(--font-display)] text-xl font-bold gradient-text">
                GenMedAI
              </span>
            </a>
            <p className="text-sm text-text-muted leading-relaxed">
              Personalized healthcare recommendations powered by your genetic and
              medical data.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-12 lg:gap-16">
            {[
              { title: "Product", links: ["Features", "How It Works", "Pricing"] },
              { title: "Company", links: ["About", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "HIPAA"] },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-1">
                  {col.title}
                </h4>
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm text-text-muted hover:text-text-primary transition-colors duration-200"
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/6 gap-2">
          <p className="text-[0.82rem] text-text-muted">
            &copy; 2026 GenMedAI. All rights reserved.
          </p>
          <p className="text-xs text-text-muted/60">
            This system is for informational purposes only and does not replace
            professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
