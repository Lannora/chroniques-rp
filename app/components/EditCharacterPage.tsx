"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { type Character } from "@/lib/types";
import imageCompression from "browser-image-compression";
import AvatarUpload from "./AvatarUpload";

// Le composant reçoit le personnage à éditer en props
export default function EditCharacterForm({ character }: { character: Character }) {
  const router = useRouter();
  // On initialise les états avec les données existantes du personnage
  const [name, setName] = useState(character.name || "");
  const [backstory, setBackstory] = useState(character.backstory || "");
  const [newImageFile, setnewImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let newAvatarUrl = character.avatar_url; // On garde l'URL actuelle par défaut

      if (newImageFile) {
        if (character.avatar_url) {
          // Si un nouvel avatar est uploadé, on supprime l'ancien
          const oldFileName = character.avatar_url.split("/").pop();
          if (oldFileName) {
            await supabase.storage.from("characters-images").remove([oldFileName]);
          }
        }
        // Compression de l'image avant l'upload
        const options = {
          maxSizeMB: 1, // Taille maximale de 1 Mo
          maxWidthOrHeight: 512, // Taille maximale de 512 x 512px 
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(newImageFile, options);
        const fileName = `${character.id}-${Date.now()}.webp`; // Nom unique pour éviter les conflits

        const { data, error: uploadError } = await supabase.storage
          .from("characters-images")
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        // On récupère l'URL de l'image uploadée
        const { data: urlData } = supabase.storage
          .from("characters-images")
          .getPublicUrl(fileName);

        newAvatarUrl = urlData.publicUrl; // On met à jour l'URL de l'avatar
      }

      const { error: updateError } = await supabase
        .from("characters")
        .update({
          name: name,
          backstory: backstory,
          avatar_url: newAvatarUrl,
        })
        .eq("id", character.id);

      if (updateError) throw updateError;

      alert("Personnage mis à jour avec succès !");
      // On redirige vers la page de détail pour voir les changements
      router.push(`/dashboard/character/${character.id}`);
      router.refresh();

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Le JSX du formulaire est presque identique à celui de CreateCharacterForm
    // mais les `value` des inputs sont liées à nos états pré-remplis.
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
        <label htmlFor="avatar" className="block text-sm font-medium text-gray-300">
          Avatar du personnage
        </label>
        <AvatarUpload
          initialPreviewUrl={character.avatar_url}
          onFileSelect={setnewImageFile}
          onFileError={setError}
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
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
        >
          {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}