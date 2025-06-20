"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateCharacterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [backstory, setBackstory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Récupérer l'utilisateur actuellement connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Insérer le personnage dans la base de données
      const { error: insertError } = await supabase.from("characters").insert({
        name: name,
        backstory: backstory,
        user_id: user.id, // On associe le personnage à l'utilisateur connecté
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        // Rediriger vers une page de succès ou le dashboard
        router.push("/dashboard");
        router.refresh(); // Important pour que le serveur mette à jour les données
      }
    } else {
        setError("Vous devez être connecté pour créer un personnage.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          Nom du personnage
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="backstory" className="block text-sm font-medium text-gray-300">
          Histoire du personnage (Backstory)
        </label>
        <textarea
          id="backstory"
          value={backstory}
          onChange={(e) => setBackstory(e.target.value)}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer le personnage"}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}