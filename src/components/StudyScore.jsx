import { useState } from "react";

const chips = [
  { label: "📶 WiFi", defaultActive: true },
  { label: "🔌 Outlets", defaultActive: false },
  { label: "🔇 Noise", defaultActive: false },
  { label: "🌙 Late hours", defaultActive: false },
  { label: "💸 Min. spend", defaultActive: false },
];

const scoreRows = [
  { label: "WiFi quality", width: "92%", val: "9.2", delay: "0s" },
  { label: "Outlets", width: "88%", val: "8.8", delay: "0.1s" },
  { label: "Noise level", width: "95%", val: "9.5", delay: "0.2s" },
  { label: "Study vibe", width: "90%", val: "9.0", delay: "0.3s" },
];

export default function StudyScore() {
  const [activeChips, setActiveChips] = useState(
    chips.map((c) => c.defaultActive)
  );

  const toggleChip = (i) => {
    setActiveChips((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <section id="score">
      <div className="score-section">
        <div className="fade-up">
          <p className="section-label">StudyScore</p>
          <h2
            className="section-title"
            style={{ maxWidth: "22ch", marginBottom: "1.2rem" }}
          >
            One number that tells you <em>everything.</em>
          </h2>
          <p
            style={{
              fontSize: "0.92rem",
              lineHeight: 1.8,
              color: "var(--text-muted)",
              marginBottom: "1.8rem",
            }}
          >
            StudyScore is an aggregate metric calculated from community ratings
            across four key dimensions. No vague star ratings — just a clear
            signal for whether a cafe is actually good for studying.
          </p>
          <div className="filters-preview">
            {chips.map((chip, i) => (
              <div
                key={chip.label}
                className={`filter-chip${activeChips[i] ? " active" : ""}`}
                onClick={() => toggleChip(i)}
              >
                {chip.label}
              </div>
            ))}
          </div>
        </div>

        <div className="score-visual fade-up">
          <div className="big-score">9.2</div>
          {scoreRows.map((row) => (
            <div className="score-row" key={row.label}>
              <span className="score-label">{row.label}</span>
              <div className="score-bar-wrap">
                <div
                  className="score-bar"
                  style={{ width: row.width, animationDelay: row.delay }}
                ></div>
              </div>
              <span className="score-val">{row.val}</span>
            </div>
          ))}
          <div
            style={{
              padding: "1rem 1.4rem",
              borderRadius: "12px",
              background: "var(--espresso)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "0.4rem",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--latte)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              StudyScore
            </span>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2rem",
                color: "var(--caramel)",
                fontWeight: 600,
              }}
            >
              9.1
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}