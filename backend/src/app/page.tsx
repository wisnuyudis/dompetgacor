export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0B1A12', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56 }}>💚</div>
        <h1 style={{ color: '#6EEB83', margin: '8px 0' }}>Dompet Gacor API</h1>
        <p style={{ opacity: 0.7 }}>Backend e-wallet aktif. Endpoint ada di <code>/api/*</code></p>
        <ul style={{ textAlign: 'left', opacity: 0.8, lineHeight: 1.8 }}>
          <li><code>GET  /api/health</code></li>
          <li><code>GET  /api/wallet</code> (auth)</li>
          <li><code>GET  /api/transactions</code> (auth)</li>
          <li><code>POST /api/topup</code> (auth)</li>
          <li><code>POST /api/transfer</code> (auth)</li>
          <li><code>POST /api/qr/pay</code> (auth)</li>
          <li><code>GET  /api/users/search?q=</code> (auth)</li>
        </ul>
      </div>
    </main>
  );
}
