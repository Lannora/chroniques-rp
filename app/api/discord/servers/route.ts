import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// On définit le type de ce que l'API Discord nous renvoie
type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: number;
};

export async function GET() {
  const supabase = await createClient();

  // --- 1. Récupérer la liste des serveurs de l'UTILISATEUR ---
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.provider_token) {
    return NextResponse.json({ error: "Utilisateur non authentifié." }, { status: 401 });
  }

  const userGuildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: { 'Authorization': `Bearer ${session.provider_token}` }
  });
  if (!userGuildsResponse.ok) {
    return NextResponse.json({ error: "Impossible de récupérer les serveurs de l'utilisateur." }, { status: 500 });
  }
  const userGuilds: DiscordGuild[] = await userGuildsResponse.json();

  // --- 2. Récupérer la liste des serveurs du BOT ---
  // On récupère le token du bot depuis notre variable d'environnement sécurisée
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "Token du bot non configuré." }, { status: 500 });
  }

  const botGuildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: { 'Authorization': `Bot ${botToken}` } // Notez le "Bot " avant le token !
  });
  if (!botGuildsResponse.ok) {
    return NextResponse.json({ error: "Impossible de récupérer les serveurs du bot." }, { status: 500 });
  }
  const botGuilds: DiscordGuild[] = await botGuildsResponse.json();

  // --- 3. Calculer l'INTERSECTION des deux listes ---

  // Pour être efficace, on met les IDs des serveurs du bot dans un Set pour une recherche rapide.
  const botGuildIds = new Set(botGuilds.map(g => g.id));

  // On filtre la liste des serveurs de l'utilisateur pour ne garder que ceux où le bot est aussi présent.
  const commonGuilds = userGuilds.filter(userGuild => botGuildIds.has(userGuild.id));

  // On retourne uniquement la liste des serveurs en commun.
  return NextResponse.json(commonGuilds);
}