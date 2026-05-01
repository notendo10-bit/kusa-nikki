'use client';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const map = new (window as any).google.maps.Map(mapRef.current, {
      center: { lat: 35.3005, lng: 139.1325 },
      zoom: 16,
      mapTypeId: 'satellite',
    });
  }, [loaded]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}