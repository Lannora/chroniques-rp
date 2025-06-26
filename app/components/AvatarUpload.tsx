"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

// On définit les "props" que le composant accepte
interface AvatarUploadProps {
  initialPreviewUrl?: string | null;
  onFileSelect: (file: File) => void;
  onFileError: (error: string) => void;
}

export default function AvatarUpload({ initialPreviewUrl, onFileSelect, onFileError }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Mo
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    if (file.size > MAX_FILE_SIZE) {
      onFileError("Le fichier est trop volumineux (max 2 Mo).");
      setPreviewUrl(null);
      return;
    }

    // On utilise URL.createObjectURL pour créer un aperçu local instantané
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file); // On envoie le fichier au composant parent
  };

  const handleComponentClick = () => {
    // Quand on clique sur le composant, on déclenche le clic sur l'input caché
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className="relative h-32 w-32 cursor-pointer rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all"
        onClick={handleComponentClick}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Aperçu de l'avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-gray-400 text-center">Choisir un avatar</span>
        )}
        {/* L'input est caché mais fonctionnel */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
      <button type="button" onClick={handleComponentClick} className="text-sm text-blue-400 hover:underline">
        Changer l'image
      </button>
    </div>
  );
}