import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RelationsFlow from "@/app/components/RelationsFlow";

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
    <div className="w-full" style={{ height: 'calc(100vh - 7rem)' }}>
        <h1 className="text-3xl font-bold mb-4">Graphe des Relations</h1>
        <RelationsFlow initialCharacters={characters} initialRelationships={relationships} />
    </div>
  );
}