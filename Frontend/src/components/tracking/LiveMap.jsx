import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { BusFront, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LiveStatusBadge from "./LiveStatusBadge";

const center = [91.9716, 22.4637]; // Lng, Lat for Mapbox
const markerColors = { Delayed: "#dc2626", Maintenance: "#f59e0b", Offline: "#64748b", Completed: "#94a3b8", Running: "#0f9488", "On Time": "#059669" };

function position(bus) { 
  const { lat, lng } = bus.currentLocation || {}; 
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : null; 
}

export default function LiveMap({ buses, selectedId, highlightedId, onSelect, className = "" }) {
  const elementRef = useRef(null); 
  const mapRef = useRef(null); 
  const markersRef = useRef([]); 
  const [error, setError] = useState("");
  const selected = buses.find((bus) => bus.id === selectedId);

  useEffect(() => {
    let active = true;
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim();
    if (!token || token === "YOUR_MAPBOX_ACCESS_TOKEN_HERE") {
      setError("Mapbox is not configured. Replace YOUR_MAPBOX_ACCESS_TOKEN_HERE with your real token in Frontend/.env.");
      return;
    }

    if (!mapRef.current && elementRef.current) {
      mapboxgl.accessToken = token;
      mapRef.current = new mapboxgl.Map({
        container: elementRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: 13,
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    if (mapRef.current) {
      // Clear old markers
      markersRef.current.forEach(marker => marker.remove());
      
      markersRef.current = buses.flatMap((bus) => {
        const point = position(bus); 
        if (!point) return [];
        
        // Create custom marker element
        const el = document.createElement('div');
        const color = markerColors[bus.status] || "#0f9488";
        const size = bus.id === selectedId ? '24px' : '16px';
        const border = bus.id === highlightedId ? '4px solid #ffffff' : '2px solid #ffffff';
        
        el.style.width = size;
        el.style.height = size;
        el.style.backgroundColor = color;
        el.style.borderRadius = '50%';
        el.style.border = border;
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.title = `${bus.name} — ${bus.status}`;
        
        el.addEventListener('click', () => {
          onSelect?.(bus.id);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(point)
          .addTo(mapRef.current);
          
        return [marker];
      });

      const points = buses.map(position).filter(Boolean);
      if (points.length === 1) { 
        mapRef.current.flyTo({ center: points[0], zoom: 15 }); 
      } else if (points.length > 1) { 
        const bounds = new mapboxgl.LngLatBounds(points[0], points[0]);
        points.forEach((item) => bounds.extend(item)); 
        mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 16 }); 
      }
    }

    return () => { active = false; };
  }, [buses, selectedId, highlightedId, onSelect]);

  return <div className={`relative isolate min-h-[320px] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-float ring-1 ring-slate-200/60 sm:min-h-[440px] dark:bg-slate-800 dark:ring-slate-700/50 ${className}`}>
    <div ref={elementRef} className="absolute inset-0" />
    {error && <div className="absolute inset-0 grid place-items-center bg-slate-50/80 backdrop-blur-sm p-6 text-center z-10 dark:bg-slate-900/80"><div><MapPin className="mx-auto h-10 w-10 text-brand-maroon dark:text-pink-400" /><h2 className="mt-4 text-xl font-display font-bold text-safar-ink">Mapbox unavailable</h2><p className="mt-2 max-w-md text-sm leading-relaxed text-safar-gray">{error}</p></div></div>}
    {!error && <div className="absolute left-4 top-4 z-10 flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-safar-ink shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-slate-900/90 dark:ring-white/10 dark:text-slate-100"><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-cyan opacity-60" /><span className="relative h-2.5 w-2.5 rounded-full bg-brand-teal" /></span>Live GPS Mapbox</div>}
    {selected && !error && <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-4 rounded-2xl bg-white/95 p-4 shadow-float ring-1 ring-black/5 backdrop-blur-xl sm:left-auto sm:w-80 dark:bg-slate-900/95 dark:ring-white/10 animate-slide-up"><div className="min-w-0"><p className="truncate font-display font-bold text-safar-ink"><BusFront className="mr-2 inline h-5 w-5 text-brand-maroon dark:text-pink-400" />{selected.name}</p><p className="mt-1 truncate text-xs font-medium text-safar-gray">{selected.currentLocation?.label || "Location not reported"}</p></div><LiveStatusBadge status={selected.status} /></div>}
  </div>;
}
