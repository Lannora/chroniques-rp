"use client";

// On importe notre client navigateur standard depuis le fichier qu'on a déjà créé !
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Rafraîchit la page et re-valide les données côté serveur
    router.refresh(); 
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
    >
      Se déconnecter
    </button>
  );
}