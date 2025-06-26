import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UserMenu from "./components/UserMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chronique RP",
  description: "Gérez vos personnages et vos histoires de RP.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserMenu />
        {children}
      </body>
    </html>
  );
}
