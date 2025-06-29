import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UserMenu from "@/app/components/UserMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chronique RP",
  description: "Gérez vos personnages et vos histoires de RP.",
  manifest: "site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],

    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-[#02302a] via-[#024a3f] to-[#02302a] text-[#f7eeda] antialiased overflow-x-hidden`}>
        
        {/* Effets de fond animés */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          
          {/* Effet de brume subtle */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-[#dba842]/5 via-transparent to-transparent opacity-30 animate-pulse-slow"></div>
          
          {/* Lignes décoratives */}
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#dba842]/20 to-transparent opacity-50"></div>
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#f7eeda]/10 to-transparent opacity-30"></div>
        </div>
        
        {/* Menu utilisateur avec backdrop */}
        <div className="relative z-50">
          <UserMenu />
        </div>
        
        {/* Contenu principal */}
        <main className="relative z-10 min-h-screen pt-24">
          {/* Container avec effets visuels */}
          <div className="relative">
            {/* Effet de glow subtil derrière le contenu */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#dba842]/5 via-transparent to-[#02302a]/20 pointer-events-none"></div>
            
            {/* Contenu des pages */}
            <div className="relative z-10 animate-fade-in">
              {children}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="relative z-10 border-t border-[#dba842]/20 bg-[#02302a]/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-[#f7eeda]/60 text-sm">
                © 2025 Chroniques RP - Donnez vie à vos légendes
              </div>
              <div className="flex items-center gap-6 text-sm text-[#f7eeda]/60">
                <a href="#" className="hover:text-[#dba842] transition-colors duration-300">Support</a>
                <a href="#" className="hover:text-[#dba842] transition-colors duration-300">Documentation</a>
                <a href="#" className="hover:text-[#dba842] transition-colors duration-300">Communauté</a>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Styles CSS inline pour les animations personnalisées */}
        <style>{`
          @keyframes fade-in {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes pulse-slow {
            0%, 100% { 
              opacity: 0.1; 
            }
            50% { 
              opacity: 0.3; 
            }
          }

        `}</style>
      </body>
    </html>
  );
}