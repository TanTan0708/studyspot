import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
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
        position: relative; width: 28px; height: 28px;
        background: white; border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg); display: flex;
        align-items: center; justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.25); border: 2px solid white;
      ">
        <img src="${imagePath}" style="width: 18px; height: 18px; transform: rotate(45deg);" />
      </div>`,
    iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -30],
  });
}

const youAreHereIcon = L.divIcon({
  className: "user-marker",
  html: `<div style="width:12px;height:12px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 0 10px rgba(59,130,246,0.5);"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6],
});

function Recenter({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, map.getZoom(), { animate: true });
  }, [pos, map]);
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score === null || score === undefined) return "#94a3b8";
  const numScore = Number(score);
  if (numScore === 0) return "#94a3b8";
  if (numScore >= 7.5) return "#22c55e";
  if (numScore >= 5.0) return "#f59e0b";
  return "#ef4444";
}

function scoreLabel(score) {
  if (!score || Number(score) === 0) return "—";
  return Number(score).toFixed(1);
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function capitalize(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function distanceMeters([lat1, lon1], [lat2, lon2]) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Filter Panel ────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = { wifi: "any", outlet: "any", noise: "any", minScore: 0 };

function FilterPanel({ filters, onChange, onReset, activeCount }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        const dropdown = document.getElementById("filter-dropdown-portal");
        if (dropdown && dropdown.contains(e.target)) return;
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const dropdown = open ? createPortal(
    <div
      id="filter-dropdown-portal"
      style={{
        position: "absolute", top: dropPos.top, right: dropPos.right,
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px",
        boxShadow: "0 16px 40px rgba(0,0,0,0.15)", padding: "16px",
        width: "220px", zIndex: 99999,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "13px", color: "#1e293b", marginBottom: "12px" }}>Filter spots</div>
      <FilterRow label="📶 WiFi" value={filters.wifi} options={[["any","Any"],["yes","Yes"],["no","No"]]} onChange={(v) => onChange({ ...filters, wifi: v })} />
      <FilterRow label="🔌 Outlets" value={filters.outlet} options={[["any","Any"],["yes","Yes"],["no","No"]]} onChange={(v) => onChange({ ...filters, outlet: v })} />
      <FilterRow label="🔊 Noise level" value={filters.noise} options={[["any","Any"],["quiet","Quiet"],["moderate","Moderate"],["loud","Loud"]]} onChange={(v) => onChange({ ...filters, noise: v })} />
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: "6px" }}>
          ⭐ Min. StudyScore: <span style={{ color: "#1e293b" }}>{filters.minScore > 0 ? Number(filters.minScore).toFixed(1) : "Any"}</span>
        </div>
        <input type="range" min="0" max="10" step="0.5" value={filters.minScore} onChange={(e) => onChange({ ...filters, minScore: parseFloat(e.target.value) })} style={{ width: "100%", accentColor: "#3b82f6" }} />
      </div>
      {activeCount > 0 && (
        <button onClick={() => { onReset(); setOpen(false); }} style={{ width: "100%", padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Clear all filters</button>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button ref={btnRef} onClick={handleToggle} style={{ display: "flex", alignItems: "center", gap: "5px", background: activeCount > 0 ? "#1e293b" : "#f1f5f9", color: activeCount > 0 ? "#fff" : "#475569", border: "1px solid " + (activeCount > 0 ? "#1e293b" : "#e2e8f0"), borderRadius: "8px", padding: "5px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
        <span>⚙ Filters</span>
        {activeCount > 0 && <span style={{ background: "#3b82f6", color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "10px" }}>{activeCount}</span>}
      </button>
      {dropdown}
    </>
  );
}

function FilterRow({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: "5px" }}>{label}</div>
      <div style={{ display: "flex", gap: "4px" }}>
        {options.map(([val, text]) => (
          <button key={val} onClick={() => onChange(val)} style={{ flex: 1, padding: "4px 0", fontSize: "11px", fontWeight: 600, border: "1px solid " + (value === val ? "#3b82f6" : "#e2e8f0"), background: value === val ? "#eff6ff" : "#f8fafc", color: value === val ? "#1d4ed8" : "#64748b", borderRadius: "6px", cursor: "pointer" }}>{text}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Cafe Detail Modal ────────────────────────────────────────────────────────

function CafeModal({ cafe, onClose, reviews, onAddReview }) {
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  if (!cafe) return null;

  const cafeReviews = reviews[cafe.cafe_id] || [];
  
  // Calculate a "Live" StudyScore combining DB score and Local Reviews
  // We map 5 stars to a 10-point scale for consistency
  const calculateAggregate = () => {
    const dbScore = Number(cafe.aggregate_score) || 0;
    if (cafeReviews.length === 0) return dbScore;
    const localAvg = (cafeReviews.reduce((acc, r) => acc + r.rating, 0) / cafeReviews.length) * 2;
    return dbScore > 0 ? (dbScore + localAvg) / 2 : localAvg;
  };

  const finalScore = calculateAggregate();
  const color = scoreColor(finalScore);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!userComment.trim()) return;
    onAddReview(cafe.cafe_id, {
      rating: userRating,
      comment: userComment,
      date: new Date().toLocaleDateString(),
    });
    setUserComment("");
    setUserRating(5);
  };

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 99999, padding: "16px",
      }}
    >
      <div style={{
        background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "420px",
        maxHeight: "90vh", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          padding: "24px", position: "relative",
        }}>
          <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
          <div style={{ fontSize: "22px", marginBottom: "6px" }}>☕</div>
          <h2 style={{ margin: "0 0 4px", color: "#fff", fontSize: "20px", fontWeight: 700 }}>{cafe.name}</h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>📍 {cafe.address}</p>
        </div>

        {/* StudyScore banner */}
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>StudyScore</div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Based on student insights</div>
          </div>
          <div style={{ background: color, color: "#fff", fontWeight: 800, fontSize: "22px", borderRadius: "12px", padding: "6px 14px" }}>
            {scoreLabel(finalScore)}
          </div>
        </div>

        {/* Info grid */}
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <InfoTile icon="📶" label="WiFi" value={cafe.wifi_available ? "Available" : "No"} positive={cafe.wifi_available} />
          <InfoTile icon="🔌" label="Outlets" value={cafe.outlet_available ? "Available" : "No"} positive={cafe.outlet_available} />
          <InfoTile icon="🔊" label="Noise" value={capitalize(cafe.noise_level)} />
          <InfoTile icon="🕒" label="Closes" value={formatTime(cafe.closing_time)} />
        </div>

        {/* Review Section */}
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 12px" }}>Community Reviews</h3>
            
            {/* Review List */}
            <div style={{ maxHeight: "150px", overflowY: "auto", marginBottom: "16px" }}>
              {cafeReviews.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>No reviews yet. Be the first!</p>
              ) : (
                cafeReviews.map((r, i) => (
                  <div key={i} style={{ padding: "8px", background: "#f8fafc", borderRadius: "8px", marginBottom: "8px", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6" }}>{"⭐".repeat(r.rating)}</span>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>{r.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Review Form */}
            <form onSubmit={handleSubmitReview} style={{ background: "#f1f5f9", padding: "12px", borderRadius: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>Rate:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span 
                    key={s} 
                    onClick={() => setUserRating(s)}
                    style={{ cursor: "pointer", fontSize: "16px", filter: s <= userRating ? "none" : "grayscale(100%)", opacity: s <= userRating ? 1 : 0.3 }}
                  >⭐</span>
                ))}
              </div>
              <textarea 
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your experience (WiFi speed, vibe...)"
                style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px", fontSize: "12px", minHeight: "60px", resize: "none", marginBottom: "8px" }}
              />
              <button type="submit" style={{ width: "100%", padding: "8px", background: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                Post Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function InfoTile({ icon, label, value, positive, fullWidth }) {
  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px", gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <div style={{ fontSize: "14px", marginBottom: "2px" }}>{icon}</div>
      <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: positive === true ? "#16a34a" : positive === false ? "#dc2626" : "#1e293b" }}>{value}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapCard({ searchQuery, nearMeActive, onNearMeUsed }) {
  const [userPos, setUserPos]           = useState(null);
  const [cafes, setCafes]               = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [filters, setFilters]           = useState(DEFAULT_FILTERS);
  const [nearMeFilter, setNearMeFilter] = useState(false);
  
  // Local Reviews State
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("studyspot_reviews");
    return saved ? JSON.parse(saved) : {};
  });

  // Sync reviews to localStorage
  useEffect(() => {
    localStorage.setItem("studyspot_reviews", JSON.stringify(reviews));
  }, [reviews]);

  const handleAddReview = (cafeId, newReview) => {
    setReviews(prev => ({
      ...prev,
      [cafeId]: [newReview, ...(prev[cafeId] || [])]
    }));
  };

  useEffect(() => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://studyspot-i2sk.onrender.com";
    fetch(`${SERVER_URL}/api/cafes`)
      .then((res) => res.json())
      .then((data) => setCafes(data))
      .catch((err) => console.error("Database fetch error:", err));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (nearMeActive) {
      setNearMeFilter(true);
      onNearMeUsed?.();
    }
  }, [nearMeActive, onNearMeUsed]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.wifi !== "any") n++;
    if (filters.outlet !== "any") n++;
    if (filters.noise !== "any") n++;
    if (filters.minScore > 0) n++;
    if (nearMeFilter) n++;
    return n;
  }, [filters, nearMeFilter]);

  const filteredCafes = useMemo(() => {
    let list = cafes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
    }
    if (nearMeFilter && userPos) {
      list = list.filter((c) => distanceMeters(userPos, [Number(c.lat), Number(c.lng)]) <= 500);
    }
    if (filters.wifi === "yes") list = list.filter((c) => c.wifi_available);
    if (filters.wifi === "no") list = list.filter((c) => !c.wifi_available);
    if (filters.outlet === "yes") list = list.filter((c) => c.outlet_available);
    if (filters.outlet === "no") list = list.filter((c) => !c.outlet_available);
    if (filters.noise !== "any") list = list.filter((c) => c.noise_level === filters.noise);
    if (filters.minScore > 0) {
      list = list.filter((c) => Number(c.aggregate_score) >= filters.minScore);
    }
    return list;
  }, [cafes, searchQuery, nearMeFilter, userPos, filters]);

  return (
    <>
      <div className="map-card">
        <div className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="card-title">Nearby spots</span>
            <span className="card-badge">● {filteredCafes.length} Found</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {nearMeFilter && <span onClick={() => setNearMeFilter(false)} style={{ fontSize: "10px", fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "3px 7px", cursor: "pointer" }}>📍 Near me ✕</span>}
            <FilterPanel filters={filters} onChange={setFilters} onReset={() => { setFilters(DEFAULT_FILTERS); setNearMeFilter(false); }} activeCount={activeFilterCount} />
          </div>
        </div>

        <div className="map-placeholder" style={{ height: "240px", position: "relative" }}>
          {userPos ? (
            <MapContainer center={userPos} zoom={15} style={{ width: "100%", height: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Recenter pos={userPos} />
              <Marker position={userPos} icon={youAreHereIcon} />
              {filteredCafes.map((cafe) => (
                <Marker key={cafe.cafe_id} position={[Number(cafe.lat), Number(cafe.lng)]} icon={createCustomIcon("public/marker-pin-02-svgrepo-com.svg")} eventHandlers={{ click: () => setSelectedCafe(cafe) }} />
              ))}
            </MapContainer>
          ) : <div className="map-loading">Loading Map…</div>}
        </div>

        <div className="cafe-list-wrapper">
          <div className="cafe-list-scroll">
            {filteredCafes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8", fontSize: "13px" }}>No spots match.</div>
            ) : (
              filteredCafes.map((cafe) => (
                <div className="cafe-mini-card" key={cafe.cafe_id} onClick={() => setSelectedCafe(cafe)} style={{ cursor: "pointer" }}>
                  <img src="/coffee-689-svgrepo-com.svg" className="cafe-icon" alt="" />
                  <div className="cafe-info">
                    <div className="cafe-name">{cafe.name}</div>
                    <div className="cafe-meta">{cafe.address.split(",")[0]}</div>
                  </div>
                  <div style={{ background: scoreColor(cafe.aggregate_score), color: "#fff", fontWeight: 700, fontSize: "12px", borderRadius: "8px", padding: "3px 8px", minWidth: "38px", textAlign: "center" }}>
                    {scoreLabel(cafe.aggregate_score)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedCafe && (
        <CafeModal 
          cafe={selectedCafe} 
          onClose={() => setSelectedCafe(null)} 
          reviews={reviews}
          onAddReview={handleAddReview}
        />
      )}
    </>
  );
}