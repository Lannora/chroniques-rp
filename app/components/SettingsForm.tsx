"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsForm({ user }: { user: User }) {
  const router = useRouter();
  // On initialise l'état avec le nom d'utilisateur existant
  const [fullName, setFullName] = useState(user.user_metadata.full_name || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // On met à jour les métadonnées de l'utilisateur
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) {
      setMessage(`Erreur: ${error.message}`);
    } else {
      setMessage("Profil mis à jour avec succès !");
      // On rafraîchit la page pour que le menu en haut à droite se mette aussi à jour
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-400">
          Email (non modifiable)
        </label>
        <input
          id="email"
          type="email"
          value={user.email || ""}
          disabled
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700/50 text-gray-400 cursor-not-allowed"
        />
      </div>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
          Pseudo
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sauvegarde..." : "Mettre à jour le profil"}
        </button>
      </div>
      {message && <p className="text-sm text-green-400">{message}</p>}
    </form>
  );
}