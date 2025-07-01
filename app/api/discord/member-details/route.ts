import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.provider_token) {
    return NextResponse.json({ error: "Utilisateur non authentifié." }, { status: 401 });
  }

  // On récupère l'ID du serveur depuis les paramètres de l'URL
  const { searchParams } = new URL(request.url);
  const guildId = searchParams.get('guild_id');

  if (!guildId) {
    return NextResponse.json({ error: "L'ID du serveur (guild_id) est manquant." }, { status: 400 });
  }

  try {
    // On appelle l'endpoint de l'API Discord pour récupérer les détails du membre
    const response = await fetch(`https://discord.com/api/v10/users/@me/guilds/${guildId}/member`, {
      headers: {
        'Authorization': `Bearer ${session.provider_token}`
      }
    });

    if (!response.ok) {
      throw new Error("Impossible de récupérer les détails du membre.");
    }

    const memberDetails = await response.json();

    // On retourne les détails (qui contiennent le pseudo "nick")
    return NextResponse.json(memberDetails);

  } catch (error) {
    console.error("Erreur lors de la récupération des détails du membre:", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}