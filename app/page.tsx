import { createClient } from "@/lib/supabase/server";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    //On vérifie si l'utilisateur a des personnages
    const { data: characters, error } = await supabase
      .from("characters")
      .select("id") // On a juste besoin de savoir s'il y en a, pas besoin de toutes les données
      .limit(1); // On s'arrête dès qu'on en a trouvé un, c'est plus performant

    // Si on trouve au moins un personnage, on redirige vers le dashboard
    if (characters && characters.length > 0) {
      redirect("/dashboard");
    }
    // Si la redirection n'a pas lieu, le reste de la page s'affiche normalement.
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        {user ? (
          // Ce contenu ne s'affiche maintenant QUE pour les utilisateurs connectés SANS personnage
          <div>
            <h1 className="text-4xl font-bold">
              Bonjour, {user.user_metadata.full_name || user.email}
            </h1>
            <p className="mt-2 text-lg text-gray-300">
              Prêt à construire des légendes ?
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-4">
              <Link href="/dashboard/create-character" className="rounded-md bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700">
                  Créer un personnage
              </Link>
              <LogoutButton />
            </div>
          </div>
        ) : (
          // Contenu si l'utilisateur N'EST PAS connecté
          <div>
            <h1 className="text-4xl font-bold">Bienvenue sur Chronique RP</h1>
            <p className="mt-2 text-lg text-gray-300">
              Connectez-vous pour commencer à écrire l'histoire de votre personnage.
            </p>
            <div className="mt-8">
              <LoginButton />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}