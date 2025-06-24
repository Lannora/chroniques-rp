import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CharacterCard, { type Character } from "@/app/components/CharacterCard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si aucun utilisateur n'est connecté, on le redirige vers la page de connexion
  if (!user) {
    redirect("/login"); // Assure-toi d'avoir une page /login ou change pour '/'
  }

  // On récupère les personnages de l'utilisateur connecté
  // RLS s'occupe de filtrer automatiquement pour ne retourner que les siens !
  const { data: characters, error } = await supabase
    .from("characters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des personnages", error);
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Mon Tableau de Bord</h1>
          <Link
            href="/dashboard/create-character"
            className="rounded-md bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            + Créer un personnage
          </Link>
        </div>

        {characters && characters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {characters.map((character: Character) => (
              <Link key={character.id} href={`/dashboard/character/${character.id}`}>
                <CharacterCard character={character} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-lg border-2 border-dashed border-gray-700">
            <h2 className="text-xl font-semibold">Aucun personnage trouvé</h2>
            <p className="text-gray-400 mt-2">
              Il est temps de donner vie à votre première légende !
            </p>
          </div>
        )}
      </div>
    </main>
  );
}