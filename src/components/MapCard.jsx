// MapCard.jsx
// This is a placeholder/mock UI for the map panel.
// When you're ready to integrate OpenStreetMap (e.g. via Leaflet),
// replace the .map-placeholder div with your <MapContainer> component here.

const cafes = [
  {
    icon: "☕",
    iconClass: "warm",
    name: "Brewed Awakening",
    meta: "WiFi · Outlets · Quiet · Open till 11 PM",
    score: "9.2",
  },
  {
    icon: "🌿",
    iconClass: "green",
    name: "The Leaf Collective",
    meta: "WiFi · Moderate · Open till 10 PM",
    score: "8.7",
  },
];

export default function MapCard() {
  return (
    <div className="hero-right">
      <div className="map-card">
        <div className="card-header">
          <span className="card-title">Nearby spots</span>
          <span className="card-badge">● Live</span>
        </div>

        {/* ── MAP PLACEHOLDER ────────────────────────────────────────────────
            Replace this div with your Leaflet <MapContainer> when ready.
            Suggested setup:
              npm install leaflet react-leaflet
              import { MapContainer, TileLayer, Marker } from 'react-leaflet'
            ─────────────────────────────────────────────────────────────── */}
        <div className="map-placeholder">
          <div className="map-blob blob1"></div>
          <div className="map-blob blob2"></div>
          <div className="map-blob blob3"></div>
          <div className="map-road road1"></div>
          <div className="map-road road2"></div>
          <div className="map-pin"></div>
          <div className="map-pin2"></div>
        </div>

        {cafes.map((cafe) => (
          <div className="cafe-mini-card" key={cafe.name}>
            <div className={`cafe-icon ${cafe.iconClass}`}>{cafe.icon}</div>
            <div className="cafe-info">
              <div className="cafe-name">{cafe.name}</div>
              <div className="cafe-meta">{cafe.meta}</div>
            </div>
            <div className="study-score">{cafe.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}