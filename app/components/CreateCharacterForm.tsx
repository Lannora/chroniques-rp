"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import imageCompression from "browser-image-compression";
import AvatarUpload from "./AvatarUpload";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { TRAITS } from "@/lib/traits"; // On importe notre liste de traits

type DiscordServer = { id: string; name: string; };
type MemberDetails = { nick: string | null; user: { global_name: string | null } };

export default function CreateCharacterForm() {
  const router = useRouter();
  
  // États pour le formulaire
  const [backstory, setBackstory] = useState("");
  const [secrets, setSecrets] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // États pour la logique Discord
  const [servers, setServers] = useState<DiscordServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [nickname, setNickname] = useState<string | null>(null);
  
  // États de chargement et d'erreur
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingServers, setIsFetchingServers] = useState(true);

  // Ref pour éviter de lancer plusieurs fois la récupération des serveurs
  const fetchInitiated = useRef(false);

  // Récupération des serveurs (inchangé)
  useEffect(() => {
    // On vérifie si notre "mémoire" indique que l'appel a déjà été lancé.
    if (fetchInitiated.current) {
      return; // Si oui, on ne fait rien et on sort.
    }
    
    // Si non, on marque que l'appel est maintenant lancé.
    fetchInitiated.current = true;

    const fetchServers = async () => {
      setIsFetchingServers(true);
      try {
        const response = await fetch('/api/discord/servers');
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
  }, []);

  // Récupération du pseudo quand un serveur est sélectionné
  useEffect(() => {
    if (!selectedServerId) return;

    const fetchMemberDetails = async () => {
      setNickname(null); // Reset
      try {
        const response = await fetch(`/api/discord/member-details?guild_id=${selectedServerId}`);
        if (!response.ok) throw new Error("Impossible de récupérer le pseudo.");
        const data: MemberDetails = await response.json();
        // Le nom du personnage est soit son pseudo sur le serveur, soit son nom global Discord
        setNickname(data.nick || data.user.global_name);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchMemberDetails();
  }, [selectedServerId]);

  const handleTraitSelect = useCallback((trait: string) => {
    setTraits((currentTraits) => {
      if (currentTraits.includes(trait)) {
        return currentTraits.filter((t) => t !== trait); // Dé-sélectionne
      } else {
        return [...currentTraits, trait]; // Sélectionne
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname) {
      setError("Le nom du personnage n'a pas pu être récupéré.");
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

    // Insertion dans la BDD avec la nouvelle structure
    const { error: insertError } = await supabase.from("characters").insert({
      user_id: user.id,
      avatar_url: imageUrl,
      server_id: selectedServerId,
      server_name: servers.find(s => s.id === selectedServerId)?.name || "",
      character_name: nickname, // On utilise le pseudo récupéré
      backstory,
      secrets,
      traits, // On sauvegarde le tableau de traits
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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
      {/* --- Section 1: Avatar et Serveur --- */}
      <div className="flex flex-col md:flex-row items-center gap-8">
        <AvatarUpload onFileSelect={setImageFile} onFileError={setError} />
        <div className="w-full space-y-4">

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

          {/* Affichage du pseudo récupéré */}
          {nickname && (
            <div className="p-3 bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-400">Nom du personnage sur ce serveur :</p>
              <p className="text-xl font-bold text-white">{nickname}</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* --- Section 2: Traits de personnalité --- */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Traits de personnalité</label>
        <Command className="max-h-48 overflow-y-auto rounded-lg border border-gray-600 bg-gray-800 text-white">
          <CommandInput placeholder="Rechercher un trait..." className="w-full px-4 py-2 bg-transparent focus:outline-none" />
          <CommandList>
            <CommandEmpty>Aucun trait trouvé.</CommandEmpty>
            <CommandGroup>
              {TRAITS.map((trait) => (
                <CommandItem
                  key={trait}
                  onSelect={() => handleTraitSelect(trait)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-700 flex justify-between items-center"
                >
                  {trait}
                  {traits.includes(trait) && <span className="text-lg text-green-400">✓</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="flex flex-wrap gap-2 mt-3">
          {traits.map((trait) => (
            <span key={trait} className="px-2 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center gap-2">
              {trait}
              <button type="button" onClick={() => handleTraitSelect(trait)} className="font-bold">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* --- Section 3: Backstory et Secrets --- */}
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
          placeholder="Écrivez l'histoire de votre personnage..."
        />
      </div>
      <div>
        <label htmlFor="secrets" className="block text-sm font-medium text-gray-300">
          Secrets du personnage
        </label>
        <textarea
          id="secrets"
          value={secrets}
          onChange={(e) => setSecrets(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Écrivez les secrets que seuls vous connaissez..."
        />
      </div>

      {/* --- Bouton de soumission --- */}
      <button type="submit" disabled={loading} /* ... */ >
        {loading ? "Création..." : "Créer le personnage"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}