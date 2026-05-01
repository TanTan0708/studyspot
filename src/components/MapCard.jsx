// MapCard.jsx
// Integrated with OpenStreetMap via react-leaflet + real-time geolocation.
// Install deps first:
//   npm install leaflet react-leaflet
// Also import Leaflet's CSS in your root file (e.g. index.jsx / App.jsx):
//   import 'leaflet/dist/leaflet.css';

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// ── Fix Leaflet's broken default icon paths when bundled with Webpack/Vite ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Cafe emoji pins ───────────────────────────────────────────────────────────
function emojiIcon(emoji) {
  return L.divIcon({
    className: "",
    html: `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));cursor:pointer;">${emoji}</div>`,
    iconAnchor: [12, 24],
    popupAnchor: [0, -28],
  });
}

// ── "You are here" blue pulsing dot ──────────────────────────────────────────
const youAreHereIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="
        position:absolute;inset:0;
        background:rgba(59,130,246,0.25);
        border-radius:50%;
        animation:pulse 2s ease-out infinite;
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:12px;height:12px;
        background:#3b82f6;
        border:2.5px solid #fff;
        border-radius:50%;
        box-shadow:0 0 6px rgba(59,130,246,0.6);
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0%   { transform: scale(1);   opacity: 0.7; }
        100% { transform: scale(2.8); opacity: 0;   }
      }
    </style>
  `,
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

// ── Recenter — imperatively moves the map whenever userPos changes ────────────
// Must receive userPos directly so it re-fires on every GPS update.
function Recenter({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.setView(pos, map.getZoom(), { animate: true });
    }
  }, [pos, map]);
  return null;
}

// ── Cafe data ─────────────────────────────────────────────────────────────────
// Coords are placeholders — swap with your actual cafe locations.
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

export default function MapCard() {
  const [userPos, setUserPos] = useState(null);   // [lat, lng] once GPS resolves
  const [geoError, setGeoError] = useState(null); // string if denied / unavailable

  // ── Real-time location tracking ────────────────────────────────────────────
  // watchPosition fires immediately AND every time the device moves.
  // We hold off rendering <MapContainer> until the first fix comes in so
  // Leaflet's initial `center` prop is always the real GPS position —
  // never a stale hardcoded default.
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation isn't supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setGeoError(
          err.code === 1
            ? "Location access denied. Please allow location in your browser settings."
            : "Couldn't get your location. Try again."
        );
      },
      {
        enableHighAccuracy: true, // use GPS chip if available
        maximumAge: 0,            // never serve a stale cached position
        timeout: 10000,           // give up after 10s and fire the error cb
      }
    );

    // Stop watching when the component unmounts
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="hero-right">
      <div className="map-card">
        <div className="card-header">
          <span className="card-title">Nearby spots</span>
          <span className="card-badge">● Live</span>
        </div>

        <div
          className="map-placeholder"
          style={{ padding: 0, overflow: "hidden", borderRadius: "12px" }}
        >
          {/* Loading state while waiting for first GPS fix */}
          {!userPos && !geoError && (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "10px", color: "#888", fontSize: "14px",
            }}>
              <div style={{ fontSize: "28px" }}>📍</div>
              Getting your location…
            </div>
          )}

          {/* Error state if geolocation failed or was denied */}
          {geoError && (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "10px", color: "#e55", fontSize: "13px",
              padding: "16px", textAlign: "center",
            }}>
              <div style={{ fontSize: "28px" }}>⚠️</div>
              {geoError}
            </div>
          )}

          {/* Only mount the map once we have real coordinates.
              This ensures MapContainer's `center` is always the actual
              GPS position and never defaults to a stale location. */}
          {userPos && (
            <MapContainer
              center={userPos}
              zoom={16}
              scrollWheelZoom={false}
              style={{ width: "100%", height: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Recenter fires every time userPos updates (i.e. you move) */}
              <Recenter pos={userPos} />

              {/* "You are here" marker */}
              <Marker position={userPos} icon={youAreHereIcon}>
                <Popup>You are here 📍</Popup>
              </Marker>

              {/* Cafe markers */}
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
          )}
        </div>

        {/* Cafe list */}
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