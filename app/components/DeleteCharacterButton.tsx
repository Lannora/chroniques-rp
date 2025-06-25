"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Le composant accepte l'ID du personnage en "prop"
export default function DeleteCharacterButton({ characterId }: { characterId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    // On demande une confirmation à l'utilisateur avant de supprimer
    // le personnage pour éviter les suppressions accidentelles
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce personnage ? Cette action est irréversible."
    );

    if (isConfirmed) {
      const { error } = await supabase
        .from("characters")
        .delete()
        .eq("id", characterId);

      if (error) {
        console.error("Erreur lors de la suppression", error);
        alert("Une erreur est survenue lors de la suppression.");
      } else {
        alert("Personnage supprimé avec succès !");
        // On redirige l'utilisateur vers le tableau de bord
        router.push("/dashboard");
        router.refresh(); // On rafraîchit les données pour que la liste soit à jour
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
    >
      Supprimer le personnage
    </button>
  );
}