"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import imageCompression from "browser-image-compression";
import AvatarUpload from "./AvatarUpload";

export default function CreateCharacterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [backstory, setBackstory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Récupérer l'utilisateur actuellement connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Vous devez être connecté pour créer un personnage.");
      setLoading(false);
      return;
    }

    try {
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

        // --- Insertion dans la base de données ---
        const { error: insertError } = await supabase.from("characters").insert({
            name: name,
            backstory: backstory,
            user_id: user.id,
            avatar_url: imageUrl,
        });

        if (insertError) {
            throw insertError;
        }

        // Si tout s'est bien passé, on redirige
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
        <AvatarUpload 
        onFileSelect={setImageFile} // On met à jour l'état imageFile du parent
        onFileError={setError}      // On met à jour l'état d'erreur du parent
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