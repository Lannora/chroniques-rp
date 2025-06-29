import Image from "next/image";
import { Character } from "@/lib/types";

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="group bg-[#f7eeda]/8 rounded-2xl overflow-hidden border border-[#dba842]/20 backdrop-blur-md transition-all duration-500 hover:bg-[#f7eeda]/12 hover:border-[#dba842]/40 hover:shadow-2xl hover:shadow-[#dba842]/20 hover:-translate-y-2 hover:scale-[1.02] relative">
      
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#dba842]/10 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-700 pointer-events-none"></div>
      
      {/* Bordure dorée animée en haut */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#dba842] to-[#f7eeda] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      
      {/* Container de l'image avec overlay */}
      <div className="relative w-full h-48 overflow-hidden">
        <Image
          // Si l'avatar_url existe, on l'utilise, sinon on met une image par défaut
          src={character.avatar_url || "/default-avatar.png"}
          alt={`Avatar de ${character.name}`}
          fill
          className="object-contain transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02302a]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Contenu de la carte */}
      <div className="p-5 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#f7eeda] truncate mb-1 group-hover:text-[#dba842] transition-colors duration-300">
              {character.name}
            </h3>
            
            {/* Informations supplémentaires - Ont mettra a la place le nom du serveurRP Discord*/}
            <div className="flex items-center gap-2 text-sm text-[#f7eeda]/70 mb-3">
              {character.backstory && (
                <span className="px-2 py-1 bg-[#dba842]/20 text-[#dba842] rounded-md text-xs font-medium border border-[#dba842]/30">
                  {character.backstory}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}