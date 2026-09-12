import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export const alt = 'TOOL HUB — ศูนย์รวมเครื่องมือออนไลน์ฟรี';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '100px',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              color: '#f43f5e',
            }}
          >
            TOOL HUB
          </div>
        </div>
        
        <div
          style={{
            fontSize: '42px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '24px',
            lineHeight: 1.4,
          }}
        >
          ศูนย์รวมเครื่องมือออนไลน์ฟรี & PDF Suite
        </div>
        
        <div
          style={{
            fontSize: '28px',
            fontWeight: 400,
            color: '#94a3b8',
            textAlign: 'center',
          }}
        >
          ปลอดภัย รวดเร็ว ทำงานบนเบราว์เซอร์ 100%
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
