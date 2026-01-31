import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Online Test Platform",
  description: "Secure and proctored online testing system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
