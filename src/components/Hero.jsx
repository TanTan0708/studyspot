import { useEffect, useState } from "react";
import MapCard from "./MapCard";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const els = document.querySelectorAll(".hero .fade-up");
    const timer = setTimeout(() => {
      els.forEach((el) => el.classList.add("visible"));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hero">
      <div className="hero-left fade-up">
        <div className="hero-eyebrow">For students, by students</div>
        <h1>
          Find your <em>perfect</em>
          <br />
          place to study
        </h1>
        <p className="hero-desc">
          Skip the guesswork. StudySpot shows you nearby cafes that are
          actually good for studying — with WiFi, outlets, calm vibes, and late
          hours.
        </p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search cafes near you…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn" onClick={() => setSearchQuery("")}>
            {searchQuery ? "✕ Clear" : "📍 Near me"}
          </button>
        </div>
        <div className="hero-actions">
          <button className="btn-primary">Explore cafes</button>
          <button className="btn-ghost">Learn more ↓</button>
        </div>
      </div>

      <div className="hero-right">
        {/* Pass the searchQuery state as a prop to MapCard */}
        <MapCard searchQuery={searchQuery} />
      </div>
    </section>
  );
}