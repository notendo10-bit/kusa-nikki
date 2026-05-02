'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [gps, setGps] = useState(null);
  const [gpsError, setGpsError] = useState(false);
  const router = useRouter();
  const mapInstance = useRef(null);
  const myMarker = useRef(null);
  const gpsRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);

    if (!navigator.geolocation) {
      setGpsError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        gpsRef.current = loc;
        setGps(loc);
      },
      () => setGpsError(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    navigator.geolocation.watchPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        gpsRef.current = loc;
        setGps(loc);
        setGpsError(false);
      },
      () => setGpsError(true),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const center = gpsRef.current || { lat: 35.3005, lng: 139.1325 };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
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

    if (gpsRef.current) {
      myMarker.current = new window.google.maps.Marker({
        position: gpsRef.current,
        map,
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
    }
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
    }
  }, [gps]);

  const goToMyLocation = () => {
    const loc = gpsRef.current;
    if (loc && mapInstance.current) {
      mapInstance.current.panTo(loc);
      mapInstance.current.setZoom(18);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100dvh', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      {gpsError && (
        <div style={{ background: '#e24b4a', color: '#fff', padding: '10px 16px', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>
          ⚠️ GPS取得できません。位置情報をONにしてください
        </div>
      )}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#5a9e22', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>🌿 草成長日記</span>
          {gps && <span style={{ color: '#c8f0a0', fontSize: 11 }}>📍 GPS取得済み</span>}
        </div>
        <button onClick={goToMyLocation} style={{ position: 'absolute', bottom: 16, right: 16, width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '2px solid #e8d5b0', color: '#4285F4', fontSize: 22, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>📍</button>
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