import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { image, stage, height } = await req.json();

  const prompt = "この写真に写っている植物をすべて特定してください。草・木・農作物など何でも。JSON形式のみで返答し、他のテキストは不要です。\n{\"plants\": [{\"name\": \"植物名（日本語）\", \"scientific\": \"学名\", \"confidence\": 確信度0-100, \"type\": \"草/木/農作物\", \"stage\": \"成長段階の説明\", \"memo\": \"農業向け一言メモ\"}]}";

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
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