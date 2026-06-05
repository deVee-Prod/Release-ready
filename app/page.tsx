"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ReleaseReadyApp = dynamic(() => import('./release-ready-app'), {
  ssr: false,
  loading: () => (
    <main style={{
      position: 'fixed', inset: 0, background: 'transparent', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '16px', fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        width: 32, height: 32, border: '2px solid rgba(255,215,0,0.2)',
        borderTop: '2px solid #FFD700', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: '9px', letterSpacing: '0.3em', color: '#6b7280', textTransform: 'uppercase', margin: 0 }}>
        Loading
      </p>
    </main>
  )
});

export default function Page() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return (
      <main style={{
        position: 'fixed', inset: 0, background: 'transparent', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '24px', fontFamily: 'Arial, sans-serif'
      }}>
        <img src="/Release Ready iCon.png?v=2" alt="Release Ready" style={{ width: 72, height: 72, objectFit: 'contain' }} />
        <p style={{ fontSize: '10px', letterSpacing: '0.5em', color: '#6b7280', textTransform: 'uppercase', margin: 0 }}>
          Release Ready
        </p>
        <button
          onClick={() => setEntered(true)}
          style={{
            marginTop: '8px',
            padding: '14px 48px',
            background: 'transparent',
            border: '1px solid rgba(255,215,0,0.3)',
            color: '#FFD700',
            borderRadius: '16px',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Enter
        </button>
      </main>
    );
  }

  return <ReleaseReadyApp />;
}
