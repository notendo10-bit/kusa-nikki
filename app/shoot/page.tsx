'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Shoot() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [gps, setGps] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, []);

  useEffect(() => {
    startCamera();
    navigator.geolocation.getCurrentPosition(pos => {
      setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [startCamera]);

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL('image/jpeg'));
  };

  const retake = () => {
    setPhoto(null);
    setResult(null);
    startCamera();
  };

  const diagnose = async () => {
    if (!photo) return;
    setLoading(true);
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photo, gps }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert('判定に失敗しました');
    }
    setLoading(false);
  };

  if (result) return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#fff8ee', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#5a9e22', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={retake} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '5px 12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>← 撮り直す</button>
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>判定結果</span>
      </div>
      <img src={photo} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
      {gps && (
        <div style={{ margin: '10px 16px 0', background: '#eaf3de', borderRadius: 12, padding: '8px 14px', fontSize: 12, color: '#3b6d11', fontWeight: 'bold' }}>
          📍 {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
        </div>
      )}
      {(result.plants || [result]).map((plant, i) => (
        <div key={i} style={{ margin: '10px 16px 0', background: '#fff', borderRadius: 20, border: '1.5px solid #e8d5b0', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#3d2c10' }}>{plant.name}</div>
            <div style={{ fontSize: 11, background: '#eaf3de', color: '#3b6d11', borderRadius: 8, padding: '2px 8px', fontWeight: 'bold' }}>{plant.type || '植物'}</div>
          </div>
          <div style={{ fontSize: 11, color: '#7a5c2e', marginBottom: 10 }}>{plant.scientific}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#7a5c2e' }}>確信度</span>
            <div style={{ flex: 1, height: 6, background: '#e8f5d0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: plant.confidence + '%', height: '100%', background: '#5a9e22', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 'bold', color: '#5a9e22' }}>{plant.confidence}%</span>
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>{plant.stage}</div>
          <div style={{ fontSize: 12, color: '#e24b4a', fontWeight: 'bold', marginTop: 4 }}>{plant.memo}</div>
        </div>
      ))}
      <button onClick={() => router.push('/')} style={{ margin: '16px', padding: 15, background: '#5a9e22', color: '#fff', border: 'none', borderRadius: 20, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', width: 'calc(100% - 32px)', borderBottom: '4px solid #3b6d11' }}>
        ✓ 保存してマップへ
      </button>
    </div>
  );

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#000', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#5a9e22', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '5px 12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>← 戻る</button>
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>撮影</span>
        {gps && <span style={{ color: '#c8f0a0', fontSize: 11, marginLeft: 'auto' }}>📍 GPS取得済み</span>}
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        {photo ? (
          <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {!photo && (
          <button onClick={takePhoto} style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '5px solid #5a9e22', cursor: 'pointer' }} />
        )}
        {photo && (
          <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button onClick={retake} style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 12, color: '#fff', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>撮り直す</button>
            <button onClick={diagnose} disabled={loading} style={{ background: loading ? '#888' : '#5a9e22', border: 'none', borderRadius: 12, color: '#fff', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}>
              {loading ? '判定中...' : '🔍 AI判定'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}