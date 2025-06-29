"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import imageCompression from "browser-image-compression";
import AvatarUpload from "./AvatarUpload"; // On garde notre composant d'upload
import { DiscordServer } from "@/lib/types"; // On importe le type pour les serveurs

export default function CreateCharacterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [backstory, setBackstory] = useState("");

  // États pour la gestion des serveurs
  const [servers, setServers] = useState<DiscordServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [isFetchingServers, setIsFetchingServers] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ce hook se déclenche une seule fois, au chargement du composant
  useEffect(() => {
    const fetchServers = async () => {
      setIsFetchingServers(true);
      try {
        const response = await fetch('/api/discord/servers', {
          method: 'GET',});
        if (!response.ok) {
          throw new Error("Impossible de charger la liste des serveurs.");
        }
        const data = await response.json();
        setServers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetchingServers(false);
      }
    };
    fetchServers();
  }, []); // Le tableau vide signifie "ne s'exécute qu'une fois"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Empêche la soumission si aucun serveur n'est sélectionné
    if (!selectedServerId) {
        setError("Veuillez sélectionner un serveur.");
        return;
    }

    setLoading(true);
    setError(null);

    // Récupérer l'utilisateur actuellement connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    try {
      // Gérer l'upload de l'image

      let imageUrl = null;
      if (imageFile) {
            // --- Traitement de l'image ---
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                fileType: 'image/webp',
            };
            const compressedFile = await imageCompression(imageFile, options);

            // On force l'extension .webp pour plus de fiabilité
            const fileName = `${user.id}_${Date.now()}.webp`;

            const { error: uploadError, data: uploadData } = await supabase
                .storage
                .from('characters-images')
                .upload(fileName, compressedFile, { cacheControl: '3600' });

            if (uploadError) {
                // Si l'erreur vient de l'upload, on la "lance" pour être attrapée par le catch
                throw uploadError;
            }

            // On récupère l'URL publique
            const { data: urlData } = supabase.storage.from('characters-images').getPublicUrl(fileName);
            imageUrl = urlData.publicUrl;
        }

      // On trouve le nom du serveur qui correspond à l'ID sélectionné
      const serverName = servers.find(s => s.id === selectedServerId)?.name || "";

      // On insère toutes les informations dans la base de données
      const { error: insertError } = await supabase.from("characters").insert({
        name,
        backstory,
        user_id: user.id,
        avatar_url: imageUrl,
        server_id: selectedServerId, // On stocke l'ID
        server_name: serverName,      // Et le nom pour un affichage facile
      });

      if (insertError) throw insertError;

      router.push("/dashboard");
      router.refresh();

    } catch (e: any) {
        // Un seul bloc 'catch' pour toutes les erreurs (upload, insert, etc.)
        setError(e.message);
    } finally {
        // 'finally' s'exécute toujours, que ça réussisse ou échoue. Parfait pour arrêter le loading.
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
      {/* Champ pour l'upload de l'avatar */}
      <AvatarUpload onFileSelect={setImageFile} onFileError={setError} />

      {/* ... champ pour le nom ... */}
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

      {/* LISTE DÉROULANTE POUR LES SERVEURS */}
      <div>
        <label htmlFor="server" className="block text-sm font-medium text-gray-300">
          Serveur Discord
        </label>
        <select
          id="server"
          value={selectedServerId}
          onChange={(e) => setSelectedServerId(e.target.value)}
          required
          disabled={isFetchingServers}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="" disabled>
            {isFetchingServers ? "Chargement des serveurs..." : "Sélectionnez un serveur"}
          </option>
          {servers.map((server) => (
            <option key={server.id} value={server.id}>
              {server.name}
            </option>
          ))}
        </select>
      </div>

      {/* ... champ pour la backstory et bouton ... */}
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