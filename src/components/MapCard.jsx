// MapCard.jsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// ── Fix Leaflet's broken default icon paths ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom Image Icon — made smaller ─────────────────────────────────────────
function createCustomIcon(imagePath) {
  return L.divIcon({
    className: "custom-marker-container",
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.25);
        border: 2px solid white;
      ">
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-image: url('${imagePath}');
          background-size: cover;
          background-position: center;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

// ── "You are here" blue pulsing dot ──────────────────────────────────────────
const youAreHereIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;background:rgba(59,130,246,0.25);border-radius:50%;animation:pulse 2s ease-out infinite;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;background:#3b82f6;border:2.5px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.6);"></div>
    </div>
    <style>@keyframes pulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.8); opacity: 0; } }</style>
  `,
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

function Recenter({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, map.getZoom(), { animate: true });
  }, [pos, map]);
  return null;
}

export default function MapCard() {
  const [userPos, setUserPos] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://studyspot-i2sk.onrender.com";
    fetch(`${SERVER_URL}/api/cafes`)
      .then((res) => res.json())
      .then((data) => setCafes(data))
      .catch((err) => console.error("Failed to fetch cafes:", err));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation isn't supported.");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => setGeoError("Location access denied or unavailable."),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="hero-right">
      <div className="map-card">
        <div className="card-header">
          <span className="card-title">Nearby spots</span>
          <span className="card-badge">● Live</span>
        </div>

        {/* Map — taller now to fill the card better */}
        <div
          className="map-placeholder"
          style={{ padding: 0, overflow: "hidden", borderRadius: "12px", height: "240px" }}
        >
          {!userPos && !geoError && (
            <div className="loading-state">📍 Getting location…</div>
          )}
          {geoError && <div className="error-state">⚠️ {geoError}</div>}

          {userPos && (
            <MapContainer
              center={userPos}
              zoom={16}
              scrollWheelZoom={false}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Recenter pos={userPos} />

              <Marker position={userPos} icon={youAreHereIcon}>
                <Popup>You are here 📍</Popup>
              </Marker>

              {cafes.map((cafe) => (
                <Marker
                  key={cafe.name}
                  position={[cafe.lat, cafe.lng]}
                  icon={createCustomIcon("src/assets/marker-pin-02-svgrepo-com.svg")}
                >
                  <Popup>
                    <strong>{cafe.name}</strong>
                    <br />
                    {cafe.meta}
                    <br />
                    <span style={{ color: "#C4842A", fontWeight: 600 }}>
                      Score: {cafe.score}
                    </span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Scrollable cafe list — shows ~3 items, hint arrow if more */}
        <div className="cafe-list-wrapper">
          <div className="cafe-list-scroll">
            {cafes.map((cafe) => (
              <div className="cafe-mini-card" key={cafe.name}>
                <img
                  src={"src/assets/coffee-689-svgrepo-com.svg"}
                  alt={cafe.name}
                  className="cafe-icon"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
                <div className="cafe-info">
                  <div className="cafe-name">{cafe.name}</div>
                  <div className="cafe-meta">{cafe.meta}</div>
                </div>
                <div className="study-score">{cafe.score}</div>
              </div>
            ))}
          </div>

          {/* Scroll hint — only shows when there are more than 3 cafes */}
          {cafes.length > 3 && (
            <div className="cafe-scroll-hint">
              <span>↓</span>
              <span>{cafes.length - 3} more</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}