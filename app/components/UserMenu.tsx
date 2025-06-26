import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import Image from "next/image";
import Link from "next/link";

// C'est un Server Component asynchrone pour pouvoir récupérer l'utilisateur
export default async function UserMenu() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si pas d'utilisateur, on n'affiche rien du tout
  if (!user) {
    return null;
  }

  // Si l'utilisateur est connecté, on affiche son avatar et le bouton de déconnexion
  return (
    <div className="absolute top-4 right-4 flex items-center gap-x-4">
      <div className="flex items-center gap-x-2">
        <Image
          src={user.user_metadata?.avatar_url || "/default-avatar.png"}
          alt="Avatar de l'utilisateur"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="text-sm font-semibold text-white">
          {user.user_metadata?.full_name || user.email}
        </span>
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-300 hover:text-white transition">Parametres</Link>
      </div>
      <LogoutButton />
    </div>
  );
}