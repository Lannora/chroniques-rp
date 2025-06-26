import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsForm from "@/app/components/SettingsForm";
import Link from "next/link";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard" className="text-blue-400 hover:underline mb-6 inline-block">
        &larr; Retour au tableau de bord
      </Link>

      <h1 className="text-4xl font-bold mb-8">Paramètres du compte</h1>

      {/* Section pour la mise à jour du profil */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-6">Profil</h2>
        {/* On passe l'objet 'user' complet au formulaire qui sera un Client Component */}
        <SettingsForm user={user} />
      </div>

      {/* On prépare la section pour la suppression du compte */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg shadow-lg p-6 md:p-8 mt-8">
         <h2 className="text-2xl font-semibold mb-4 text-red-400">Zone de Danger</h2>
         <p className="text-gray-300 mb-4">La suppression de votre compte est une action définitive qui entraînera la perte de toutes vos données (personnages, histoires, etc.) conformément au RGPD.</p>
         {/* Le bouton de suppression sera implémenté plus tard */}
         <button disabled className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white opacity-50 cursor-not-allowed">
            Supprimer mon compte (Bientôt disponible)
         </button>
      </div>
    </div>
  );
}