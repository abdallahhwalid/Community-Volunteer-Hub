                                                                                             import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's broken default icon paths in Vite/webpack builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ requests, height = "420px", onMarkerClick }) {
  const mapRef      = useRef(null);  // DOM element ref
  const instanceRef = useRef(null);  // Leaflet map instance ref

  // ── Initialise map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (instanceRef.current) return; // already created

    const map = L.map(mapRef.current, {
      center: [30.0444, 31.2357], // Cairo default
      zoom: 10,
      scrollWheelZoom: false,
    });
    instanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    return () => {
      map.remove();
      instanceRef.current = null;
    };
  }, []);

  // ── Add / refresh markers whenever requests change ───────────────────────
  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    if (!requests || requests.length === 0) return;

    const bounds = [];

    requests.forEach((req) => {
      if (!req.location || req.location === "Online") return;

      // Use Open-Meteo geocoding (free, no API key)
      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          req.location
        )}&count=1&language=en&format=json`
      )
        .then((r) => r.json())
        .then((data) => {
          if (!data.results?.length) return;
          const { latitude: lat, longitude: lng } = data.results[0];

          const badgeColor =
            req.status === "Open"
              ? "#10B981"
              : req.status === "In Progress"
              ? "#3B82F6"
              : "#6B7280";

          const icon = L.divIcon({
            className: "",
            html: `
              <div style="
                position:relative;
                display:flex;
                flex-direction:column;
                align-items:center;
              ">
                <div style="
                  background:${badgeColor};
                  color:white;
                  font-size:11px;
                  font-weight:700;
                  padding:4px 8px;
                  border-radius:8px;
                  white-space:nowrap;
                  max-width:140px;
                  overflow:hidden;
                  text-overflow:ellipsis;
                  box-shadow:0 2px 8px rgba(0,0,0,0.25);
                  font-family:'DM Sans',sans-serif;
                ">
                  ${req.title.length > 22 ? req.title.substring(0, 22) + "…" : req.title}
                </div>
                <div style="
                  width:0;height:0;
                  border-left:6px solid transparent;
                  border-right:6px solid transparent;
                  border-top:8px solid ${badgeColor};
                "></div>
              </div>`,
            iconAnchor: [70, 40],
          });

          const marker = L.marker([lat, lng], { icon }).addTo(map);

          marker.bindPopup(`
            <div style="font-family:'DM Sans',sans-serif;min-width:180px;">
              <p style="font-weight:700;font-size:14px;margin:0 0 4px;">${req.title}</p>
              <p style="font-size:12px;color:#6B7280;margin:0 0 6px;">${req.category} · ${req.location}</p>
              <span style="
                display:inline-block;
                padding:2px 8px;
                border-radius:99px;
                font-size:11px;
                font-weight:700;
                background:${badgeColor}20;
                color:${badgeColor};
              ">${req.status}</span>
            </div>`);

          if (onMarkerClick) {
            marker.on("click", () => onMarkerClick(req));
          }

          bounds.push([lat, lng]);

          // Fit map to all markers after last one loads
          if (bounds.length === requests.filter((r) => r.location && r.location !== "Online").length) {
            if (bounds.length === 1) {
              map.setView(bounds[0], 13);
            } else {
              map.fitBounds(bounds, { padding: [40, 40] });
            }
          }
        })
        .catch(() => {/* geocoding failed for this location, skip silently */});
    });
  }, [requests, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: "100%",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    />
  );
}