Set-Content -Path C:\Users\noten\kusa-nikki\app\shoot\page.tsx -Encoding UTF8 -Value @'
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Shoot() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [stage, setStage] = useState(2);
  const [height, setHeight] = useState('');
  const router = useRouter();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
  }, []);

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL('image/jpeg'));
  };

  const stages = ['発芽', '展開', '成長', '開花', '結実'];

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff8ee', fontFamily: 'sans-serif' }}>
      {/* ヘッダー */}
      <div style={{ background: '#5a9e22', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '5px 12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>← 戻る</button>
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>撮影</span>
      </div>

      {/* カメラ */}
      <div style={{ position: 'relative', background: '#000', flex: '0 0 280px' }}>
        {photo ? (
          <img src={photo} style={{ width: '100%', height: 280, objectFit: 'cover' }} />
        ) : (
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 280, objectFit: 'cover' }} />
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {!photo && (
          <button onClick={takePhoto} style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            width: 64, height: 64, borderRadius: '50%',
            background: '#fff', border: '4px solid #5a9e22', cursor: 'pointer',
          }} />
        )}
        {photo && (
          <button onClick={() => setPhoto(null)} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 10,
            color: '#fff', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold',
          }}>撮り直す</button>
        )}
      </div>

      {/* ステージ選択 */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: '#7a5c2e', marginBottom: 8 }}>成長ステージ</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {stages.map((s, i) => (
            <button key={i} onClick={() => setStage(i + 1)} style={{
              flex: 1, padding: '8px 2px', borderRadius: 14,
              border: stage === i + 1 ? 'none' : '1.5px solid #e0d0b0',
              background: stage === i + 1 ? '#5a9e22' : '#fdefd6',
              color: stage === i + 1 ? '#fff' : '#7a5c2e',
              fontWeight: 'bold', fontSize: 11, cursor: 'pointer',
            }}>
              St.{i + 1}<br /><span style={{ fontSize: 9 }}>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 草丈 */}
      <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#7a5c2e' }}>草丈</span>
        <input
          type="number"
          placeholder="15"
          value={height}
          onChange={e => setHeight(e.target.value)}
          style={{ width: 80, padding: '8px 12px', borderRadius: 14, border: '1.5px solid #e0d0b0', fontSize: 14, fontWeight: 'bold', background: '#fdefd6', color: '#3d2c10' }}
        />
        <span style={{ fontSize: 13, color: '#7a5c2e', fontWeight: 'bold' }}>cm</span>
      </div>

      {/* AI判定ボタン */}
      <button
        disabled={!photo}
        style={{
          margin: '16px 16px 0', padding: 15,
          background: photo ? '#5a9e22' : '#c8c8c8',
          color: '#fff', border: 'none', borderRadius: 20,
          fontSize: 16, fontWeight: 'bold', cursor: photo ? 'pointer' : 'default',
          borderBottom: photo ? '4px solid #3b6d11' : 'none',
        }}
      >
        🔍 AIに草を聞く！
      </button>
    </div>
  );
}
'@