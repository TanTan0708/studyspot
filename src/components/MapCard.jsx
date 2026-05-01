// MapCard.jsx
// Integrated with OpenStreetMap via react-leaflet.
// Install deps first:
//   npm install leaflet react-leaflet
// Also import Leaflet's CSS in your root file (e.g. index.jsx / App.jsx):
//   import 'leaflet/dist/leaflet.css';

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// ── Fix Leaflet's broken default icon paths when bundled with Webpack/Vite ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom pin icons using emoji SVG so they match the card's style ─────────
function emojiIcon(emoji) {
  return L.divIcon({
    className: "",
    html: `<div style="
      font-size: 24px;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
      cursor: pointer;
    ">${emoji}</div>`,
    iconAnchor: [12, 24],
    popupAnchor: [0, -28],
  });
}

// ── Recenter helper — snaps the map to new coords without remounting ─────────
function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

// ── Cafe data — add lat/lng to each spot ────────────────────────────────────
// These are example coords around BGC, Taguig. Swap for real addresses.
const cafes = [
  {
    icon: "☕",
    iconClass: "warm",
    name: "Brewed Awakening",
    meta: "WiFi · Outlets · Quiet · Open till 11 PM",
    score: "9.2",
    lat: 14.5547,
    lng: 121.0509,
  },
  {
    icon: "🌿",
    iconClass: "green",
    name: "The Leaf Collective",
    meta: "WiFi · Moderate · Open till 10 PM",
    score: "8.7",
    lat: 14.5565,
    lng: 121.0478,
  },
];

// Center map between all pins
const mapCenter = [
  cafes.reduce((s, c) => s + c.lat, 0) / cafes.length,
  cafes.reduce((s, c) => s + c.lng, 0) / cafes.length,
];

export default function MapCard() {
  return (
    <div className="hero-right">
      <div className="map-card">
        <div className="card-header">
          <span className="card-title">Nearby spots</span>
          <span className="card-badge">● Live</span>
        </div>

        {/* ── LIVE MAP ──────────────────────────────────────────────────────
            OSM tiles via react-leaflet. scrollWheelZoom is off so the map
            doesn't hijack page scroll; users can still drag and pinch-zoom.
            ─────────────────────────────────────────────────────────────── */}
        <div
          className="map-placeholder"
          style={{ padding: 0, overflow: "hidden", borderRadius: "12px" }}
        >
          <MapContainer
            center={mapCenter}
            zoom={15}
            scrollWheelZoom={false}
            style={{ width: "100%", height: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Recenter center={mapCenter} />

            {cafes.map((cafe) => (
              <Marker
                key={cafe.name}
                position={[cafe.lat, cafe.lng]}
                icon={emojiIcon(cafe.icon)}
              >
                <Popup>
                  <strong>{cafe.name}</strong>
                  <br />
                  {cafe.meta}
                  <br />
                  <span style={{ color: "#7c6fe0", fontWeight: 600 }}>
                    Score: {cafe.score}
                  </span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* ── CAFE LIST ────────────────────────────────────────────────────── */}
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