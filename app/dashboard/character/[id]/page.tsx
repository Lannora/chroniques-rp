import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DeleteCharacterButton from "@/app/components/DeleteCharacterButton";

// La page reçoit les "params" de l'URL en props
export default async function CharacterDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // On récupère UN SEUL personnage dont l'ID correspond à celui dans l'URL
  const fixParams = await params; 
  const { data: character, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", fixParams.id) // La condition : où l'id est égal à params.id
    .single(); // On s'attend à recevoir un seul résultat

  // Si le personnage n'est pas trouvé (ou n'appartient pas à l'utilisateur grâce à RLS),
  // on peut rediriger ou afficher un message.
  if (error || !character) {
    console.error("Erreur ou personnage non trouvé", error);
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-blue-400 hover:underline mb-6 block">
          &larr; Retour au tableau de bord
        </Link>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 w-48 h-48 relative mx-auto">
              <Image
                src={character.avatar_url || "/default-avatar.png"}
                alt={`Avatar de ${character.name}`}
                fill
                className="object-cover rounded-full border-4 border-gray-700"
                sizes="192px"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{character.name}</h1>
              <h2 className="text-xl font-semibold text-gray-400 mb-4">Histoire du personnage</h2>
              {/* On utilise 'whitespace-pre-wrap' pour respecter les sauts de ligne de la backstory */}
              <p className="text-gray-300 whitespace-pre-wrap">
                {character.backstory}
              </p>
            </div>
            <div className="mt-6 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-400 mb-4">Actions</h3>
              <div className="flex gap-x-4">
                <Link 
                  href={`/dashboard/character/${character.id}/edit`}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Modifier le personnage
                </Link>
                <DeleteCharacterButton characterId={character.id} avatarUrl={character.avatar_url}/>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}