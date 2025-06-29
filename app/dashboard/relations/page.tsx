import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RelationsFlow from "@/app/components/RelationsFlow";
import Link from "next/link";

export default async function RelationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect("/"); }

  // 1. On récupère TOUS les personnages de l'utilisateur
  const { data: characters } = await supabase
    .from("characters")
    .select(`*`);

  // 2. On récupère TOUTES les relations liées aux personnages de cet utilisateur
  //    (RLS fait le filtrage pour nous)
  const { data: relationships } = await supabase
    .from("relationships")
    .select(`*`);

  if (!characters || !relationships) {
    return <div>Chargement des données ou erreur...</div>;
  }

  return (
    <div className="w-full h-[calc(100vh-7rem)] overflow-hiden">
        <div className="flex justify-between items-center py-6">
            <h1 className="text-4xl font-bold">Relations entre personnages</h1>
            <Link href="/dashboard" className="text-blue-400 hover:underline block">
                &larr; Retour au tableau de bord
            </Link>
        </div>

        <RelationsFlow initialCharacters={characters} initialRelationships={relationships} />
    </div>
  );
}