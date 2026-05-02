import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { image, gps } = await req.json();

  let locationInfo = '日本の農村地帯';
  if (gps) {
    try {
      const geoRes = await fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + gps.lat + ',' + gps.lng + '&key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY + '&language=ja');
      const geoData = await geoRes.json();
      if (geoData.results?.[0]) {
        locationInfo = geoData.results[0].formatted_address;
      }
    } catch (e) {}
  }

  const prompt = '撮影場所：' + locationInfo + '\n\nこの写真に写っている植物を特定してください。日本の植物図鑑レベルの精度で、葉の形・色・質感・樹皮・全体的な樹形を詳しく分析してください。JSON形式のみで返答し、他のテキストは不要です。\n{"plants": [{"name": "植物名（日本語）", "scientific": "学名", "confidence": 確信度0-100の数値, "type": "草/木/農作物", "stage": "現在の成長段階", "memo": "農業向け一言メモ", "advice": "確信度が70未満の場合のみ、より正確な判定のための撮影アドバイス。それ以外は空文字"}]}';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image.split(',')[1] } },
          { type: 'text', text: prompt }
        ]
      }]
    }),
  });

  const data = await response.json();
  console.log('API response:', JSON.stringify(data));

  if (!data.content || !data.content[0]) {
    return NextResponse.json({ error: 'API error', detail: data }, { status: 500 });
  }

  const text = data.content[0].text;
  console.log('Raw text:', text);

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Parse error', raw: text }, { status: 500 });
  }
}