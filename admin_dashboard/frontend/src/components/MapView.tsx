import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  markerLabel?: string;
}


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;

function MapView({
  latitude,
  longitude,
  zoom = 10,
  height = "400px",
  markerLabel,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    //clean up existing map instance on refresh
    if (mapRef.current && mapRef.current.remove) {
      try {
        mapRef.current.remove();
      } catch (err) {
        console.warn("Failed to remove map instance:", err);
      }
      mapRef.current = null;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard-satellite",
      center: [longitude, latitude],
      zoom,
    });

    //nav controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    
    //marker
    new mapboxgl.Marker()
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup().setHTML(
          `<strong>${markerLabel || "Location"}</strong>`
        )
      )
      .addTo(map);

    mapRef.current = map;
    
    return () => map.remove();
  }, [latitude, longitude, zoom, markerLabel]);

  return <div ref={mapContainerRef} style={{ width: "100%", height }} />;
}

export default MapView;
