export const metadata = {
  title: 'Dompet Gacor API',
  description: 'Backend API untuk aplikasi e-wallet Dompet Gacor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>{children}</body>
    </html>
  );
}
