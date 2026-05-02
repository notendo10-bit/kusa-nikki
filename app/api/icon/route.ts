import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const size = url.searchParams.get('size') || '192';
  const s = parseInt(size);
  
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '"><rect width="' + s + '" height="' + s + '" rx="' + (s * 0.22) + '" fill="#5a9e22"/><text x="50%" y="55%" font-size="' + (s * 0.55) + '" text-anchor="middle" dominant-baseline="middle">🌿</text></svg>';
  
  return new NextResponse(svg, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}