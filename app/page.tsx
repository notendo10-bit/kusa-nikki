'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const PINS = [
  { id: 1, lat: 35.3008, lng: 139.1320, name: 'スギナ', stage: 'St.2', color: '#E24B4A', days: '4日前' },
  { id: 2, lat: 35.3002, lng: 139.1335, name: 'カタバミ', stage: 'St.1', color: '#5a9e22', days: '2週間前' },
  { id: 3, lat: 35.2998, lng: 139.1318, name: 'ドクダミ', stage: 'St.3', color: '#BA7517', days: '1週間前' },
];

export default function Home() {
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [gps, setGps] = useState(null);
  const router = useRouter();
  const mapInstance = useRef(null);
  const myMarker = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);

    navigator.geolocation.watchPosition(pos => {
      setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 35.3005, lng: 139.1325 },
      zoom: 17,
      disableDefaultUI: true,
      styles: [
        { elementType: 'geometry.fill', stylers: [{ color: '#e8f5d0' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a8d8ea' }] },
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });
    mapInstance.current = map;

    PINS.forEach(pin => {
      const marker = new window.google.maps.Marker({
        position: { lat: pin.lat, lng: pin.lng },
        map,
        label: { text: '草', color: '#fff', fontWeight: 'bold' },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 18,
          fillColor: pin.color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2.5,
        },
      });
      marker.addListener('click', () => setSelected(pin));
    });
    map.addListener('click', () => setSelected(null));
  }, [loaded]);

  useEffect(() => {
    if (!gps || !mapInstance.current) return;
    if (myMarker.current) {
      myMarker.current.setPosition(gps);
    } else {
      myMarker.current = new window.google.maps.Marker({
        position: gps,
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        },
        zIndex: 999,
      });
      mapInstance.current.panTo(gps);
    }
  }, [gps]);

  return (
    <div style={{ width: '100vw', height: '100dvh', position: 'relative', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#5a9e22', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>🌿 草成長日記</span>
          {gps && <span style={{ color: '#c8f0a0', fontSize: 11 }}>📍 GPS取得済み</span>}
        </div>
        {selected && (
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 20, padding: '16px 20px', border: '2px solid #c0dd97', minWidth: 200, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#3d2c10' }}>{selected.name}</div>
            <div style={{ fontSize: 12, color: '#7a5c2e', margin: '4px 0 12px' }}>{selected.days} · {selected.stage}</div>
            <button style={{ background: '#5a9e22', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 24px', fontWeight: 'bold', cursor: 'pointer' }}>記録を見る →</button>
          </div>
        )}
        <button onClick={() => router.push('/shoot')} style={{ position: 'absolute', bottom: 16, right: 16, width: 56, height: 56, borderRadius: '50%', background: '#5a9e22', border: '3px solid #fff', color: '#fff', fontSize: 28, cursor: 'pointer' }}>+</button>
      </div>
      <div style={{ background: '#fff', borderTop: '1.5px solid #e8d5b0', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button style={{ flex: 1, padding: '12px 4px 16px', border: 'none', background: 'transparent', fontSize: 10, fontWeight: 'bold', color: '#5a9e22', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 22 }}>🗺</span>
          <span style={{ borderBottom: '2px solid #5a9e22' }}>マップ</span>
        </button>
        <button onClick={() => router.push('/shoot')} style={{ flex: 1, padding: '12px 4px 16px', border: 'none', background: 'transparent', fontSize: 10, fontWeight: 'bold', color: '#7a5c2e', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 22 }}>📷</span>撮影
        </button>
        <button style={{ flex: 1, padding: '12px 4px 16px', border: 'none', background: 'transparent', fontSize: 10, fontWeight: 'bold', color: '#7a5c2e', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 22 }}>📋</span>記録
        </button>
      </div>
    </div>
  );
}