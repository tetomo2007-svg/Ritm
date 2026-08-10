import "./globals.css";

export const metadata = {
  title: "Ritm - Music Player",
  description: "Waveform music player app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}

