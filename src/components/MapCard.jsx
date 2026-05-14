import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
        <img src="${imagePath}" style="
          width: 18px;
          height: 18px;
          transform: rotate(45deg);
        " />
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

const youAreHereIcon = L.divIcon({
  className: "user-marker",
  html: `<div style="width: 12px; height: 12px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function Recenter({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, map.getZoom(), { animate: true });
  }, [pos, map]);
  return null;
}

// Score color helper — green when high, amber in the middle, red when low
function scoreColor(score) {
  if (!score || score === 0) return "#94a3b8";
  if (score >= 7.5) return "#22c55e";
  if (score >= 5) return "#f59e0b";
  return "#ef4444";
}

// Format TIME value from DB (e.g. "22:00:00" → "10:00 PM")
function formatTime(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ─── Cafe Detail Modal ────────────────────────────────────────────────────────
function CafeModal({ cafe, onClose }) {
  if (!cafe) return null;

  const score = cafe.aggregate_score ? parseFloat(cafe.aggregate_score) : null;
  const color = scoreColor(score);

  // Close on backdrop click
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "slideUp 0.2s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            padding: "24px 24px 20px",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          <div style={{ fontSize: "22px", marginBottom: "6px" }}>☕</div>
          <h2
            style={{
              margin: "0 0 4px",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {cafe.name}
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>
            📍 {cafe.address}
          </p>
        </div>

        {/* StudyScore banner */}
        <div
          style={{
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              StudyScore
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
              Weighted study friendliness
            </div>
          </div>
          <div
            style={{
              background: color,
              color: "#fff",
              fontWeight: 800,
              fontSize: "22px",
              borderRadius: "12px",
              padding: "6px 14px",
              minWidth: "58px",
              textAlign: "center",
            }}
          >
            {score !== null ? score.toFixed(1) : "—"}
          </div>
        </div>

        {/* Info grid */}
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <InfoTile icon="📶" label="WiFi" value={cafe.wifi_available ? "Available" : "Not available"} positive={cafe.wifi_available} />
          <InfoTile icon="🔌" label="Outlets" value={cafe.outlet_available ? "Available" : "Not available"} positive={cafe.outlet_available} />
          <InfoTile icon="🔊" label="Noise level" value={cafe.noise_level ? capitalize(cafe.noise_level) : "—"} />
          <InfoTile icon="🕒" label="Closes at" value={formatTime(cafe.closing_time)} />
          <InfoTile icon="💸" label="Min. spend" value={cafe.min_spend != null ? `₱${parseFloat(cafe.min_spend).toFixed(2)}` : "—"} fullWidth />
        </div>

        {/* Footer note */}
        <div style={{ padding: "0 24px 20px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
            StudyScore is based on student reviews
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}

function InfoTile({ icon, label, value, positive, fullWidth }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "12px",
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      <div style={{ fontSize: "16px", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: positive === true ? "#16a34a" : positive === false ? "#dc2626" : "#1e293b",
          marginTop: "2px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Main MapCard ─────────────────────────────────────────────────────────────
export default function MapCard({ searchQuery }) {
  const [userPos, setUserPos] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [geoError, setGeoError] = useState(null);
  const [selectedCafe, setSelectedCafe] = useState(null);

  useEffect(() => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://studyspot-i2sk.onrender.com";
    fetch(`${SERVER_URL}/api/cafes`)
      .then((res) => res.json())
      .then((data) => setCafes(data))
      .catch((err) => console.error("Database fetch error:", err));
  }, []);

  const filteredCafes = useMemo(() => {
    if (!searchQuery) return cafes;
    const q = searchQuery.toLowerCase();
    return cafes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [searchQuery, cafes]);

  useEffect(() => {
    if (!navigator.geolocation) { setGeoError("Not supported"); return; }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setGeoError("Denied"),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <>
      <div className="map-card">
        <div className="card-header">
          <span className="card-title">Nearby spots</span>
          <span className="card-badge">● {filteredCafes.length} Found</span>
        </div>

        <div className="map-placeholder" style={{ height: "240px", position: "relative" }}>
          {userPos ? (
            <MapContainer center={userPos} zoom={15} style={{ width: "100%", height: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Recenter pos={userPos} />
              <Marker position={userPos} icon={youAreHereIcon} />
              {filteredCafes.map((cafe) => (
                <Marker
                  key={cafe.cafe_id}
                  position={[cafe.lat, cafe.lng]}
                  icon={createCustomIcon("public/marker-pin-02-svgrepo-com.svg")}
                >
                  <Popup>
                    <div className="popup-box">
                      <h3 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>{cafe.name}</h3>
                      <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#666" }}>{cafe.address}</p>
                      <div style={{ fontSize: "10px", borderTop: "1px solid #eee", paddingTop: "5px" }}>
                        <div>📶 WiFi: {cafe.wifi_available ? "Yes" : "No"}</div>
                        <div>🔌 Outlets: {cafe.outlet_available ? "Yes" : "No"}</div>
                        <div>🕒 Closes: {formatTime(cafe.closing_time)}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="map-loading">Loading Map...</div>
          )}
        </div>

        <div className="cafe-list-wrapper">
          <div className="cafe-list-scroll">
            {filteredCafes.map((cafe) => {
              const score = cafe.aggregate_score ? parseFloat(cafe.aggregate_score) : null;
              const color = scoreColor(score);
              return (
                <div
                  className="cafe-mini-card"
                  key={cafe.cafe_id}
                  onClick={() => setSelectedCafe(cafe)}
                  style={{ cursor: "pointer" }}
                >
                  <img src="/coffee-689-svgrepo-com.svg" className="cafe-icon" alt="" />
                  <div className="cafe-info">
                    <div className="cafe-name">{cafe.name}</div>
                    <div className="cafe-meta">{cafe.address.split(",")[0]}</div>
                  </div>

                  {/* StudyScore badge */}
                  <div
                    className="study-score"
                    style={{
                      background: color,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "13px",
                      borderRadius: "8px",
                      padding: "3px 8px",
                      minWidth: "40px",
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {score !== null ? score.toFixed(1) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedCafe && (
        <CafeModal cafe={selectedCafe} onClose={() => setSelectedCafe(null)} />
      )}
    </>
  );
}