// app/api/discord/servers/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { DiscordGuild } from "@/lib/types";


// Cette fonction essaiera de faire un fetch jusqu'à 3 fois en cas d'échec.
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        // Si la réponse est bonne, on la retourne et on arrête.
        return response;
      }
      console.warn(`Tentative n°${attempt} pour ${url} a échoué. Statut: ${response.status}`);
      if (attempt === maxRetries) {
        // Si c'est la dernière tentative, on retourne la mauvaise réponse pour analyse.
        return response;
      }
    } catch (error) {
      console.error(`Erreur réseau lors de la tentative n°${attempt} pour ${url}`, error);
      if (attempt === maxRetries) {
        // Si la dernière tentative échoue à cause d'une erreur réseau, on lève l'erreur.
        throw error;
      }
    }
    // On attend un peu avant de réessayer
    await new Promise(res => setTimeout(res, 500));
  }
  // Ne devrait jamais être atteint, mais pour la sécurité de TypeScript :
  return null;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.provider_token) {
    return NextResponse.json({ error: "Utilisateur non authentifié." }, { status: 401 });
  }

  try {
    // --- 1. Récupérer les serveurs de l'UTILISATEUR ---
    const userGuildsResponse = await fetchWithRetry(
      'https://discord.com/api/v10/users/@me/guilds',{
      headers: { 'Authorization': `Bearer ${session.provider_token}` },
      next: { revalidate: 86400 } // Revalidation tous les 24 heures
    }
    );
    if (!userGuildsResponse || !userGuildsResponse.ok) {
      return NextResponse.json({ error: "Impossible de récupérer les serveurs de l'utilisateur après plusieurs tentatives." }, { status: 500 });
    }
    const userGuilds: DiscordGuild[] = await userGuildsResponse.json();

    // --- 2. Récupérer les serveurs du BOT ---
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "Token du bot non configuré." }, { status: 500 });
    }
    const botGuildsResponse = await fetchWithRetry(
      'https://discord.com/api/v10/users/@me/guilds',{
      headers: { 'Authorization': `Bot ${botToken}` },
      next: { revalidate: 86400 } // Revalidation tous les 24 heures
    }
    );
    if (!botGuildsResponse || !botGuildsResponse.ok) {
      return NextResponse.json({ error: "Impossible de récupérer les serveurs du bot après plusieurs tentatives." }, { status: 500 });
    }
    const botGuilds: DiscordGuild[] = await botGuildsResponse.json();

    // --- 3. Calculer l'INTERSECTION ---
    const botGuildIds = new Set(botGuilds.map(g => g.id));
    const commonGuilds = userGuilds.filter(userGuild => botGuildIds.has(userGuild.id));

    return NextResponse.json(commonGuilds);

  } catch (error) {
    console.error("Erreur fatale dans la route d'API:", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}