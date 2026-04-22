const steps = [
  {
    number: "01",
    title: "Share your location",
    desc: "Allow location access and we'll immediately surface cafes around you — no sign-up needed to browse.",
    delay: "0s",
  },
  {
    number: "02",
    title: "Set your filters",
    desc: "Need outlets? Must-have WiFi? Open past midnight? Dial in exactly what matters for your session.",
    delay: "0.1s",
  },
  {
    number: "03",
    title: "Pick your spot",
    desc: "Check the StudyScore, read community reviews, and head out knowing you've chosen wisely.",
    delay: "0.2s",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-section" id="how">
      <div className="how-inner">
        <p className="section-label fade-up">How it works</p>
        <h2 className="section-title fade-up">
          From lost to <em>locked in,</em>
          <br />
          in three steps.
        </h2>
        <div className="steps">
          {steps.map((s) => (
            <div
              className="step fade-up"
              key={s.number}
              style={{ transitionDelay: s.delay }}
            >
              <div className="step-number">{s.number}</div>
              <div className="step-title">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}