import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex-client";
import { getToken } from "@/lib/auth-server";

import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hack4Us",
  description: "Hack4Us",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();

  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased`}
      >
        <ConvexClientProvider initialToken={token}>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
