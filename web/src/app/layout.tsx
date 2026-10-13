import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Art Mela Registration | Pahchan Foundation",
  description: "Pahchan Foundation Art Mela participant registration.",
  icons: {
    icon: "/pahchan-logo.png",
    apple: "/pahchan-logo.png",
  },
};

const themeColor = "#0d1b2a";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content={themeColor} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
