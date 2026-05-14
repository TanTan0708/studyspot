import { useEffect, useState, useCallback } from "react";
import MapCard from "./MapCard";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [nearMeActive, setNearMeActive] = useState(false);

  useEffect(() => {
    const els = document.querySelectorAll(".hero .fade-up");
    const timer = setTimeout(() => {
      els.forEach((el) => el.classList.add("visible"));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Called by MapCard after it handles the Near Me trigger
  const handleNearMeUsed = useCallback(() => {
    setNearMeActive(false);
  }, []);

  function handleSearchButtonClick() {
    if (searchQuery) {
      // If there's text, clear it (existing behaviour)
      setSearchQuery("");
    } else {
      // If empty, fire Near Me filter
      setNearMeActive(true);
    }
  }

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
          <button className="search-btn" onClick={handleSearchButtonClick}>
            {searchQuery ? "✕ Clear" : "📍 Near me"}
          </button>
        </div>
        <div className="hero-actions">
          <button className="btn-primary">Explore cafes</button>
          <button className="btn-ghost">Learn more ↓</button>
        </div>
      </div>

      <div className="hero-right">
        <MapCard
          searchQuery={searchQuery}
          nearMeActive={nearMeActive}
          onNearMeUsed={handleNearMeUsed}
        />
      </div>
    </section>
  );
}