'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false });
      setRecords(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100dvh', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', background: '#fff8ee' }}>
      <div style={{ background: '#5a9e22', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>🌿 草成長日記</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {loading && <div style={{ textAlign: 'center', color: '#7a5c2e', marginTop: 40 }}>読み込み中...</div>}
        {!loading && records.length === 0 && (
          <div style={{ textAlign: 'center', color: '#7a5c2e', marginTop: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            まだ記録がありません
          </div>
        )}
        {records.map((rec, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #e8d5b0', marginBottom: 12, overflow: 'hidden' }}>
            {rec.photo_url && (
              <img src={rec.photo_url} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
            )}
            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#7a5c2e', marginBottom: 8 }}>
                📍 {rec.lat?.toFixed(5)}, {rec.lng?.toFixed(5)} · {new Date(rec.created_at).toLocaleDateString('ja-JP')}
              </div>
              {(rec.plants || []).map((plant, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: '#3d2c10' }}>{plant.name}</div>
                  <div style={{ fontSize: 10, background: '#eaf3de', color: '#3b6d11', borderRadius: 8, padding: '2px 6px', fontWeight: 'bold' }}>{plant.type || '植物'}</div>
                  <div style={{ fontSize: 11, color: '#5a9e22', fontWeight: 'bold', marginLeft: 'auto' }}>{plant.confidence}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderTop: '1.5px solid #e8d5b0', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button onClick={() => router.push('/')} style={{ flex: 1, padding: '12px 4px 16px', border: 'none', background: 'transparent', fontSize: 10, fontWeight: 'bold', color: '#7a5c2e', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 22 }}>🗺</span>マップ
        </button>
        <button onClick={() => router.push('/shoot')} style={{ flex: 1, padding: '12px 4px 16px', border: 'none', background: 'transparent', fontSize: 10, fontWeight: 'bold', color: '#7a5c2e', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 22 }}>📷</span>撮影
        </button>
        <button style={{ flex: 1, padding: '12px 4px 16px', border: 'none', background: 'transparent', fontSize: 10, fontWeight: 'bold', color: '#5a9e22', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 22 }}>📋</span>
          <span style={{ borderBottom: '2px solid #5a9e22' }}>記録</span>
        </button>
      </div>
    </div>
  );
}