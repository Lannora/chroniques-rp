import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditCharacterForm from "@/app/components/EditCharacterPage";
export default async function EditCharacterPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fixParams = await params; // On attend que les params soient résolus
  // On récupère le personnage dont l'ID correspond à celui dans l'URL
  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("id", fixParams.id)
    .single();

  if (!character) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Modifier {character.name}</h1>
      {/* On passe les données du personnage au formulaire */}
      <EditCharacterForm character={character} />
    </main>
  );
}