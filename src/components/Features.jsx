const features = [
  {
    title: "Location-aware search",
    desc: "Instantly see cafes within reach using your device's geolocation — no manual address entry needed.",
    delay: "0s",
  },
  {
    title: "Study-specific filters",
    desc: "Filter by WiFi, power outlets, noise level, minimum spend, and closing time. Google Maps can't do this.",
    delay: "0.1s",
  },
  {
    title: "Community StudyScore",
    desc: "Aggregated ratings from real students who've actually studied there — not just \"good coffee\" reviews.",
    delay: "0.2s",
  },
  {
    title: "Late-night filter",
    desc: "Dedicated filter for cafes open past 10 PM — because deadlines don't care what time it is.",
    delay: "0.05s",
  },
  {
    title: "Real-time cafe data",
    desc: "Powered by OpenStreetMap — accurate hours, photos, and addresses, always up to date.",
    delay: "0.15s",
  },
  {
    title: "Write reviews",
    desc: "Rate and review cafes on study suitability. Help fellow students find their next favorite spot.",
    delay: "0.25s",
  },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <p className="section-label fade-up">Why StudySpot</p>
      <h2 className="section-title fade-up">
        Built for the <em>late-night grind.</em>
      </h2>
      <div className="features-grid">
        {features.map((f) => (
          <div
            className="feature-card fade-up"
            key={f.title}
            style={{ transitionDelay: f.delay }}
          >
            <div className="feature-title">{f.title}</div>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}