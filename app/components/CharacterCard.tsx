import Image from "next/image";

// On définit le "type" de l'objet character pour que TypeScript soit content
export type Character = {
  id: number;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/50 transition-shadow duration-300">
      <div className="relative w-full h-48">
        <Image
          // Si l'avatar_url existe, on l'utilise, sinon on met une image par défaut
          src={character.avatar_url || "/default-avatar.png"}
          alt={`Avatar de ${character.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold truncate">{character.name}</h3>
      </div>
    </div>
  );
}