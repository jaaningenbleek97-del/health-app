import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppFrame } from "@/components/AppFrame";

export const metadata: Metadata = {
  title: "Natura — Natural wellness",
  description:
    "Local-first fitness, natural supplements, exercise reminders, and natural remedies.",
  applicationName: "Natura",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Natura",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#5C7D5A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
