"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import imageCompression from "browser-image-compression";
import AvatarUpload from "./AvatarUpload";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { TRAITS } from "@/lib/traits";

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

  // Récupération des serveurs
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
      setNickname(null);
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
        return currentTraits.filter((t) => t !== trait);
      } else {
        return [...currentTraits, trait];
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
    <div className="min-h-screen bg-gradient-to-br from-[#02302a] to-[#024a3f] text-[#f7eeda] overflow-x-hidden py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <span className="text-3xl">🎭</span>
            Créer un nouveau personnage
          </h1>
          <p className="text-lg text-[#f7eeda]/70">
            Donnez vie à votre personnage avec tous ses détails et secrets
          </p>
        </div>

        {/* Formulaire principal */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 border border-[#f7eeda]/20">
          {/* Section 1: Avatar et Serveur */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#02302a] mb-6 flex items-center gap-2">
              <span className="text-xl">🖼️</span>
              Avatar et Serveur Discord
            </h2>
            
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-shrink-0">
                <AvatarUpload onFileSelect={setImageFile} onFileError={setError} />
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <label htmlFor="server" className="block text-sm font-semibold text-[#02302a] mb-2">
                    Serveur Discord
                  </label>
                  <select
                    id="server"
                    value={selectedServerId}
                    onChange={(e) => setSelectedServerId(e.target.value)}
                    required
                    disabled={isFetchingServers}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#02302a]/20 bg-[#f7eeda]/50 text-[#02302a] shadow-sm focus:border-[#dba842] focus:ring-2 focus:ring-[#dba842]/20 focus:outline-none disabled:opacity-50 transition-all duration-200"
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

                {nickname && (
                  <div className="p-4 bg-gradient-to-r from-[#dba842]/10 to-[#dba842]/5 rounded-xl border border-[#dba842]/30">
                    <p className="text-sm font-medium text-[#02302a]/70 mb-1">Nom du personnage sur ce serveur :</p>
                    <p className="text-xl font-bold text-[#02302a] flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      {nickname}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Traits de personnalité */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#02302a] mb-6 flex items-center gap-2">
              <span className="text-xl">✨</span>
              Traits de personnalité
            </h2>
            
            <div className="bg-[#f7eeda]/30 rounded-xl p-6 border border-[#02302a]/10">
              <Command className="max-h-48 overflow-y-auto rounded-lg border-2 border-[#02302a]/20 bg-white shadow-sm">
                <CommandInput 
                  placeholder="Rechercher un trait..." 
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-[#02302a] placeholder-[#02302a]/50" 
                />
                <CommandList>
                  <CommandEmpty className="py-4 text-center text-[#02302a]/70">
                    Aucun trait trouvé.
                  </CommandEmpty>
                  <CommandGroup>
                    {TRAITS.map((trait) => (
                      <CommandItem
                        key={trait}
                        onSelect={() => handleTraitSelect(trait)}
                        className="px-4 py-3 cursor-pointer hover:bg-[#dba842]/10 flex justify-between items-center text-[#02302a] transition-colors duration-150"
                      >
                        {trait}
                        {traits.includes(trait) && (
                          <span className="text-lg text-[#dba842] font-bold">✓</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>

              <div className="flex flex-wrap gap-2 mt-4">
                {traits.map((trait) => (
                  <span 
                    key={trait} 
                    className="px-3 py-2 bg-[#dba842] text-[#02302a] rounded-full text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {trait}
                    <button 
                      type="button" 
                      onClick={() => handleTraitSelect(trait)} 
                      className="font-bold hover:text-red-600 transition-colors duration-150"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Backstory et Secrets */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#02302a] mb-6 flex items-center gap-2">
              <span className="text-xl">📚</span>
              Histoire et Secrets
            </h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="backstory" className="block text-sm font-semibold text-[#02302a] mb-2">
                  Histoire du personnage (Backstory)
                </label>
                <textarea
                  id="backstory"
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#02302a]/20 bg-[#f7eeda]/30 text-[#02302a] shadow-sm focus:border-[#dba842] focus:ring-2 focus:ring-[#dba842]/20 focus:outline-none transition-all duration-200 resize-none"
                  placeholder="Racontez l'histoire de votre personnage, son passé, ses motivations..."
                />
              </div>

              <div>
                <label htmlFor="secrets" className="block text-sm font-semibold text-[#02302a] mb-2">
                  Secrets du personnage
                </label>
                <textarea
                  id="secrets"
                  value={secrets}
                  onChange={(e) => setSecrets(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#02302a]/20 bg-[#f7eeda]/30 text-[#02302a] shadow-sm focus:border-[#dba842] focus:ring-2 focus:ring-[#dba842]/20 focus:outline-none transition-all duration-200 resize-none"
                  placeholder="Les secrets que seuls vous connaissez sur votre personnage..."
                />
              </div>
            </div>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Bouton de soumission */}
          <div className="flex justify-center">
            <button 
              type="submit" 
              disabled={loading || !nickname}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#02302a]/30 border-t-[#02302a] rounded-full animate-spin"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <span className="text-xl">🎭</span>
                  Créer le personnage
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}