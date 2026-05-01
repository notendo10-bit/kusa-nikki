import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { image, stage, height } = await req.json();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: image.split(',')[1] },
          },
          {
            type: 'text',
            text: この草の写真を見て以下をJSON形式で返してください。他のテキストは不要です。
{
  "name": "草の名前（日本語）",
  "scientific": "学名",
  "confidence": 確信度0-100の数値,
  "stage": "成長ステージの説明",
  "memo": "農業向けの一言メモ（除草タイミングなど）"
}
成長ステージ：St.、草丈：cm
          }
        ]
      }]
    }),
  });

  const data = await response.json();
  const text = data.content[0].text;
  const result = JSON.parse(text.replace(/\\\json|\\\/g, '').trim());
  return NextResponse.json(result);
}