import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Character } from "@/lib/types";
import CharacterCard from "@/app/components/CharacterCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si aucun utilisateur n'est connecté, on le redirige vers la page de connexion
  if (!user) {
    redirect("/");
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
    <main className="min-h-screen bg-gradient-to-br from-[#02302a] to-[#024a3f] text-[#f7eeda] overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-8 animate-fade-in">
        <h1 className="text-4xl font-bold mb-6">Tableau de Bord</h1>

        {/* Stats Cards 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           
        </div> */}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Characters Section - Takes 4 columns */}
          <div className="lg:col-span-4">
            <div className="bg-[#f7eeda]/8 rounded-3xl p-8 border border-[#dba842]/20 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-[#dba842]/5 via-transparent to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"></div>
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h2 className="text-2xl font-bold text-[#f7eeda]">Mes Personnages</h2>
                <div className="flex gap-3">
                  <Link
                    href="/dashboard/relations"
                    className="btn-primary"
                  >
                    🔗 Relations
                  </Link>
                  <Link
                    href="/dashboard/create-character"
                    className="btn-primary"
                  >
                    ✨ Créer un personnage
                  </Link>
                </div>
              </div>

              {characters && characters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
                  {characters.map((character: Character) => (
                    <Link 
                      key={character.id} 
                      href={`/dashboard/character/${character.id}`}
                      className="group block transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="transform transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-[#dba842]/20">
                        <CharacterCard character={character} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-6 rounded-2xl border-2 border-dashed border-[#dba842]/30 bg-[#f7eeda]/5 relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#dba842]/20 to-[#f7eeda]/20 flex items-center justify-center text-4xl">
                    🎭
                  </div>
                  <h3 className="text-2xl font-bold text-[#f7eeda] mb-4">Aucun personnage trouvé</h3>
                  <p className="text-[#f7eeda]/70 mb-8 max-w-md mx-auto">
                    Il est temps de donner vie à votre première légende ! Créez votre premier personnage et commencez votre aventure.
                  </p>
                  <Link
                    href="/dashboard/create-character"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#dba842] to-[#dba842]/80 text-[#02302a] font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#dba842]/30"
                  >
                    ✨ Créer mon premier personnage
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}