import { createBrowserClient } from '@supabase/ssr'

// On crée le client Supabase avec les variables d'environnement
// Assurez-vous que ces variables sont définies dans votre environnement
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)