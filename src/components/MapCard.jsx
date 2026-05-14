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

// Custom Icon Function
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

export default function MapCard({ searchQuery }) {
  const [userPos, setUserPos] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [geoError, setGeoError] = useState(null);

  // Fetch from your database via API
  useEffect(() => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://studyspot-i2sk.onrender.com";
    fetch(`${SERVER_URL}/api/cafes`)
      .then((res) => res.json())
      .then((data) => setCafes(data))
      .catch((err) => console.error("Database fetch error:", err));
  }, []);

  // Filter cafes based on Hero's search input
  const filteredCafes = useMemo(() => {
    if (!searchQuery) return cafes;
    const q = searchQuery.toLowerCase();
    return cafes.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.address.toLowerCase().includes(q)
    );
  }, [searchQuery, cafes]);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Not supported");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => setGeoError("Denied"),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
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
                      <div>🕒 Closes: {cafe.closing_time}</div>
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
          {filteredCafes.map((cafe) => (
            <div className="cafe-mini-card" key={cafe.cafe_id}>
              <img src="/coffee-689-svgrepo-com.svg" className="cafe-icon" alt="" />
              <div className="cafe-info">
                <div className="cafe-name">{cafe.name}</div>
                <div className="cafe-meta">{cafe.address.split(',')[0]}</div>
              </div>
              {/* StudyScore aligned to the right */}
              <div className="study-score">
                {cafe.aggregate_score ? parseFloat(cafe.aggregate_score).toFixed(1) : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}