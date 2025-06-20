import { createClient } from "@/lib/supabase/server"; // On importe notre nouveau client serveur
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton"; // On va le créer juste après

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        {user ? (
          // Contenu si l'utilisateur EST connecté
          <div>
            <h1 className="text-4xl font-bold">
              Bonjour, {user.user_metadata.full_name || user.email}
            </h1>
            <p className="mt-2 text-lg text-gray-300">
              Prêt à construire des légendes ?
            </p>
            <div className="mt-8">
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