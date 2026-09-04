import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UK Brand Lover | London to Dhaka",
  description:
    "Authentic British beauty and personal care, picked from Boots and Superdrug, air-freighted to your door in Dhaka.",
  keywords: ["UK beauty", "Boots Bangladesh", "Superdrug Bangladesh", "CeraVe", "The Ordinary"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
