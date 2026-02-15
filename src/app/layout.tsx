import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebhookPro - Debug Webhooks in Seconds",
  description: "Capture, inspect, and debug webhooks in real-time. The modern webhook tester for developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-[#0A0A0A]">
        {children}
      </body>
    </html>
  );
}
